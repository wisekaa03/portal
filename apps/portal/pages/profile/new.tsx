/** @format */

//#region Imports NPM
import type { Request } from 'express';
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import type { NextPageContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { format as dateFnsFormat } from 'date-fns';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import type { UserContext, Data, Profile, ProfileInput } from '@lib/types';
import { LDAP_NEW_USER, LDAP_CHECK_USERNAME } from '@lib/queries';
import { resizeImage } from '@lib/utils';
import { ProfileContext } from '@lib/context';
import snackbarUtils from '@lib/snackbar-utils';
import { Contact } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileEditComponent from '@front/components/profile/edit';
//#endregion

const newParameters: ProfileInput = {
  contact: Contact.PROFILE,
  notShowing: true,
  disabled: false,
  gender: 0,
  birthday: undefined,
  username: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
};

const ProfileEditPage: I18nPage<{ ctx: NextPageContext }> = ({ t, i18n, ctx, ...rest }): React.ReactElement => {
  const router = useRouter();
  const [current, setCurrent] = useState<ProfileInput>(newParameters);
  const [updated, setUpdated] = useState<ProfileInput>(newParameters);
  const [thumbnailPhoto, setThumbnail] = useState<File | undefined>();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = __SERVER__ ? ((ctx?.req as Request)?.session?.passport as UserContext) : useContext(ProfileContext);
  const locale = i18n.language as 'ru' | 'en' | undefined;
  const isAdmin = user?.isAdmin ?? false;

  const [ldapNewUser, { loading: loadingLdapNewUser, error: errorLdapNewUser }] = useMutation<Data<'ldapNewUser', Profile>>(LDAP_NEW_USER, {
    onCompleted: (data) => {
      if (data.ldapNewUser?.id) {
        router.push(`/profile/edit/${data.ldapNewUser.id}`);
      }
    },
  });

  const [checkUsername, { loading: loadingCheckUsername, error: errorCheckUsername }] = useMutation<
    Data<'ldapCheckUsername', boolean>,
    { value: string }
  >(LDAP_CHECK_USERNAME);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (current && acceptedFiles.length > 0) {
        setThumbnail(acceptedFiles[0]);
        setCurrent({ ...current, thumbnailPhoto: (await resizeImage(acceptedFiles[0])) as string });
      }
    },
    [current],
  );

  const handleCheckUsername = async (): Promise<void> => {
    if (updated.username) {
      const { username } = updated;
      const resultCheckUsername = await checkUsername({
        variables: {
          value: username,
        },
      });
      const { ldapCheckUsername } = resultCheckUsername.data ?? { ldapCheckUsername: false };

      if (ldapCheckUsername === false) {
        snackbarUtils.error(t('profile:checkUsername:busy', { current: username }));
      } else if (ldapCheckUsername === true) {
        snackbarUtils.show(t('profile:checkUsername:free', { current: username }), 'success');
      }
    }
  };

  const handleChange = (name: keyof ProfileInput) => (event: React.ChangeEvent<Element>, changedValue?: unknown) => {
    const element = event.target as HTMLInputElement;
    const value = changedValue || (element.type === 'checkbox' ? element.checked : element.value);

    if (isAdmin && current) {
      // const result = name === 'gender' ? +value : value;
      setCurrent({ ...current, [name]: value });
      setUpdated({ ...updated, [name]: value, disabled: updated.contact !== Contact.PROFILE });
    }
  };

  const handleBirthday = (date: Date | null): void => {
    if (current) {
      setCurrent({ ...current, birthday: date ? dateFnsFormat(date, 'yyyy-MM-dd') : null });
    }
    if (updated) {
      setUpdated({ ...updated, birthday: date ? dateFnsFormat(date, 'yyyy-MM-dd') : null });
    }
  };

  const handleSave = (): void => {
    ldapNewUser({
      variables: {
        ldap: updated,
        photo: thumbnailPhoto,
      },
    });
  };

  useEffect(() => {
    if (errorLdapNewUser) {
      snackbarUtils.error(errorLdapNewUser);
    }
    if (errorCheckUsername) {
      snackbarUtils.error(errorCheckUsername);
    }
  }, [errorCheckUsername, errorLdapNewUser]);

  const hasUpdate = useMemo<boolean>(() => {
    if (loadingLdapNewUser) {
      return true;
    }
    if (
      updated && Object.keys(updated).length > 1 && updated.contact === Contact.PROFILE
        ? updated.firstName || updated.lastName || updated.middleName
        : (updated.firstName || updated.lastName || updated.middleName) && updated.username
    ) {
      return !!updated || !!thumbnailPhoto;
    }
    return false;
  }, [loadingLdapNewUser, thumbnailPhoto, updated]);

  return (
    <>
      <Head>
        <title>{t('profile:new.title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <ProfileEditComponent
          isAdmin={false}
          newProfile
          loadingCheckUsername={loadingCheckUsername}
          loadingProfile={false}
          loadingChanged={loadingLdapNewUser}
          profile={current}
          hasUpdate={hasUpdate}
          onDrop={onDrop}
          handleCheckUsername={handleCheckUsername}
          handleChange={handleChange}
          handleBirthday={handleBirthday}
          handleSave={handleSave}
          locale={locale}
        />
      </MaterialUI>
    </>
  );
};

ProfileEditPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileEditPage);
