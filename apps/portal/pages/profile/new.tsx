/** @format */

//#region Imports NPM
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import Head from 'next/head';
import { useMutation } from '@apollo/react-hooks';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { PROFILE, LDAP_NEW_USER, CURRENT_USER } from '@lib/queries';
import { resizeImage } from '@lib/utils';
import { ProfileContext } from '@lib/context';
import { format } from '@lib/dayjs';
import snackbarUtils from '@lib/snackbar-utils';
import { Data, Profile, ProfileInput, Contact } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileEditComponent from '@front/components/profile/edit';
//#endregion

const newParameters: ProfileInput = {
  contact: Contact.PROFILE,
  username: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  disabled: true,
  notShowing: false,
};

const ProfileEditPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const [current, setCurrent] = useState<ProfileInput>(newParameters);
  const [updated, setUpdated] = useState<ProfileInput>(newParameters);
  const [thumbnailPhoto, setThumbnail] = useState<File | undefined>();

  const { user } = useContext(ProfileContext);
  const { isAdmin } = user || { isAdmin: false };

  const [ldapNewUser, { loading: loadingLdapNewUser, error: errorLdapNewUser }] = useMutation<
    Data<'ldapNewUser', Profile>
  >(LDAP_NEW_USER);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (current && acceptedFiles.length > 0) {
        setThumbnail(acceptedFiles[0]);
        setCurrent({ ...current, thumbnailPhoto: (await resizeImage(acceptedFiles[0])) as string });
      }
    },
    [current],
  );

  const handleChange = (name: keyof ProfileInput, value_?: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const element: EventTarget & HTMLInputElement = event.target;
    const value: string | boolean | number = value_ || (element.type === 'checkbox' ? element.checked : element.value);

    if (isAdmin && current) {
      const result = name === 'gender' ? +value : value;

      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result });
    }
  };

  const handleBirthday = (date: MaterialUiPickersDate, value?: string | null | undefined): void => {
    if (current && updated) {
      setCurrent({ ...current, birthday: value ? new Date(value) : undefined });
      setUpdated({ ...updated, birthday: value ? new Date(format(value, 'YYYY-MM-DD')) : undefined });
    }
  };

  const handleSave = (): void => {
    ldapNewUser({
      variables: {
        profile: updated,
        thumbnailPhoto,
      },
    });
  };

  useEffect(() => {
    if (errorLdapNewUser) {
      snackbarUtils.error(errorLdapNewUser);
    }
  }, [errorLdapNewUser]);

  const hasUpdate = useMemo<boolean>(() => {
    if (loadingLdapNewUser) {
      return true;
    }
    if (updated && Object.keys(updated).length === 1 && updated.id) {
      return false;
    }
    return !!updated || !!thumbnailPhoto;
  }, [loadingLdapNewUser, thumbnailPhoto, updated]);

  return (
    <>
      <Head>
        <title>{t('profile:new.title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <ProfileEditComponent
          isAdmin={isAdmin}
          newProfile={true}
          loadingProfile={false}
          loadingChanged={loadingLdapNewUser}
          profile={current}
          hasUpdate={hasUpdate}
          onDrop={onDrop}
          handleChange={handleChange}
          handleBirthday={handleBirthday}
          handleSave={handleSave}
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
