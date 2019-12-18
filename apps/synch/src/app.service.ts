/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService, LdapResponseUser, LdapResonseGroup } from '@app/ldap';
import { User, UserSettings } from '@app/portal/user/models/user.dto';
import { LoginService, Gender } from '@app/portal/shared/interfaces';
import { ADMIN_GROUP } from 'apps/portal/lib/constants';
import { ImageService } from '@app/image';
import { Group } from '@app/portal/group/models/group.dto';
import { GroupEntity } from '../../portal/src/group/group.entity';
import { UserService } from '../../portal/src/user/user.service';
import { ProfileService } from '../../portal/src/profile/profile.service';
import { GroupService } from '../../portal/src/group/group.service';
import { UserEntity } from '../../portal/src/user/user.entity';
import { ProfileEntity } from '../../portal/src/profile/profile.entity';
import { Profile } from '../../portal/src/profile/models/profile.dto';
// #endregion

@Injectable()
export class SynchService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
    private readonly imageService: ImageService,
  ) {}

  synchronization = async (): Promise<boolean> => {
    const users = await this.ldapService.synchronization();

    // if (users) {
    //   users.forEach(async (ldapUser) => {
    //     try {
    //       const user = await this.userService.readByUsername(ldapUser.sAMAccountName, false);

    //       this.userService.createFromLdap(ldapUser, user).catch((error: Error) => {
    //         this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');
    //         throw error;
    //       });
    //     } catch (error) {
    //       this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');
    //     }
    //   });

    //   return true;
    // }

    if (users) {
      const updatedUsers: UserEntity[] = [];
      const updatedProfiles: ProfileEntity[] = [];
      const updatedGroups: GroupEntity[] = [];

      users.forEach(async (ldapUser) => {
        if (!updatedUsers.find((u) => u.username === ldapUser.sAMAccountName)) {
          let groups: GroupEntity[] = [];
          let profile = updatedProfiles.find((p) => p.loginIdentificator === ldapUser.objectGUID.toString());

          if (!profile) {
            profile = await this.createProfile(ldapUser);
            updatedProfiles.push(profile);
          }

          if (ldapUser.groups.length) {
            const groupsPromises = ldapUser.groups.map(async (ldapGroup: LdapResonseGroup) => {
              let createdGroup = updatedGroups.find((g) => g.loginIdentificator === ldapGroup.objectGUID);

              if (!createdGroup) {
                createdGroup = await this.createGroup(ldapGroup);
                updatedGroups.push(createdGroup);
              }

              return createdGroup;
            });

            groups = await Promise.all(groupsPromises);
          }

          updatedUsers.push(await this.createUser(ldapUser, profile, groups));
        }
      });

      debugger;

      return true;
    }

    return false;
  };

  private createUser = async (
    ldapUser: LdapResponseUser,
    profile: ProfileEntity,
    groups: GroupEntity[],
  ): Promise<UserEntity> => {
    const defaultSettings: UserSettings = {
      lng: 'ru',
    };

    const user = await this.userService.readByUsername(ldapUser.sAMAccountName, false, false);

    const userEntity: User = {
      settings: defaultSettings,
      ...user,
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      groupIds: groups.map((g) => g.id),
      isAdmin: Boolean(groups.find((group) => group.name === ADMIN_GROUP)),
      profileId: profile.id,
    };

    return this.userService.create(userEntity);
  };

  private createProfile = async (ldapUser: LdapResponseUser): Promise<ProfileEntity> => {
    const profile = await this.profileService.profileByIdentificator(ldapUser.objectGUID);

    let manager: LdapResponseUser | ProfileEntity | undefined =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager
        ? await this.ldapService.searchByDN(ldapUser.manager)
        : undefined;

    if (manager && manager.objectGUID) {
      manager = await this.profileService.profileByIdentificator(manager.objectGUID);
    }

    let comment;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }
    const {
      companyEng = undefined,
      nameEng = undefined,
      departmentEng = undefined,
      otdelEng = undefined,
      positionEng = undefined,
      gender = undefined,
    } = comment;

    let { birthday } = comment;
    birthday = !birthday || birthday === '' ? undefined : new Date(Date.parse(birthday));

    const [department, otdel] = ldapUser.department ? ldapUser.department.split(/\s*,\s*/, 2) : [undefined, undefined];

    const thumbnailPhotoBuffer = ldapUser.thumbnailPhoto ? Buffer.from(ldapUser.thumbnailPhoto, 'base64') : undefined;

    /* eslint-disable prettier/prettier */
    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService
        .imageResize(thumbnailPhotoBuffer, 250, 250)
        .then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    /* eslint-enable prettier/prettier */
    const thumbnailPhoto40 = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;

    const profileEntity: Profile = {
      ...profile,
      dn: ldapUser.dn,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID,
      username: ldapUser.sAMAccountName,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName: ldapUser.middleName,
      birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      country: ldapUser.co,
      postalCode: ldapUser.postalCode,
      town: ldapUser.l,
      region: ldapUser.st,
      street: ldapUser.streetAddress,
      company: ldapUser.company,
      department,
      otdel,
      title: ldapUser.title,
      managerId: manager && (manager as Profile).id,
      email: ldapUser.mail,
      telephone: ldapUser.telephoneNumber,
      workPhone: ldapUser.otherTelephone,
      mobile: ldapUser.mobile,
      fax: ldapUser.facsimileTelephoneNumber,
      room: ldapUser.physicalDeliveryOfficeName,
      companyEng,
      nameEng,
      departmentEng,
      otdelEng,
      positionEng,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      notShowing: !!(parseInt(ldapUser.flags, 10) === 1),
      thumbnailPhoto: (thumbnailPhoto as unknown) as string,
      thumbnailPhoto40: (thumbnailPhoto40 as unknown) as string,
    };

    return this.profileService.create(profileEntity);
  };

  private createGroup = async (ldapGroup: LdapResonseGroup): Promise<GroupEntity> => {
    const group = await this.groupService.groupByIdentificator(ldapGroup.objectGUID);

    const groupEntity: Group = {
      ...group,
      loginIdentificator: ldapGroup.objectGUID,
      name: ldapGroup.sAMAccountName as string,
      dn: ldapGroup.dn,
      loginService: LoginService.LDAP,
    };

    return this.groupService.create(groupEntity);
  };
}
