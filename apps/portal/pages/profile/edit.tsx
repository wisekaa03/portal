/** @format */

// #region Imports NPM
import React, { useEffect, useState, useCallback, useContext } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/react-hooks';
// #endregion
// #region Imports Local
import { Profile } from '../../src/profile/models/profile.dto';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { PROFILE, CHANGE_PROFILE } from '../../lib/queries';
import { resizeImage } from '../../lib/utils';
import { ProfileContext } from '../../lib/context';
import { format } from '../../lib/dayjs';
import snackbarUtils from '../../lib/snackbar-utils';
import ProfileEditComponent from '../../components/profile/edit';
import { ProfileEditPageProps } from '../../components/profile/types';
// #endregion

const ProfileEditPage: I18nPage<ProfileEditPageProps> = ({ t, id, ...rest }): React.ReactElement => {
  const { user } = useContext(ProfileContext);
  const { isAdmin } = user || { isAdmin: false };
  const [current, setCurrent] = useState<Profile | undefined>();
  const [updated, setUpdated] = useState<Profile | undefined>();

  const { loading: loadingProfile, error: errorProfile, data: dataProfile } = useQuery(PROFILE, { variables: { id } });

  const [changeProfile, { loading: loadingChanged, error: errorChanged }] = useMutation(CHANGE_PROFILE);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length) {
        const thumbnailPhoto = (await resizeImage(acceptedFiles[0])) as string;
        setCurrent({ ...current, thumbnailPhoto });
        setUpdated({ ...updated, thumbnailPhoto });
      }
    },
    [current, updated],
  );

  const handleChange = (name: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el: EventTarget & HTMLInputElement = e.target;
    const value: string | boolean | number = el.type === 'checkbox' ? el.checked : el.value;

    if (isAdmin) {
      const result = name === 'gender' ? +value : value;

      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result });
    }
  };

  const handleBirthday = (value: Date | null): void => {
    setCurrent({ ...current, birthday: new Date(value) });
    setUpdated({ ...updated, birthday: new Date(format(value, 'YYYY-MM-DD')) });
  };

  const handleSave = (): void => {
    changeProfile({
      variables: {
        profile: updated,
        thumbnailPhoto: updated.thumbnailPhoto,
      },
    });
  };

  useEffect(() => {
    if (isAdmin && id) {
      if (dataProfile) {
        setCurrent(dataProfile.profile);
        setUpdated({ id } as any);
      }
    } else if (user) {
      setCurrent(user.profile);
    }
  }, [dataProfile, isAdmin, id, user]);

  useEffect(() => {
    if (errorProfile) {
      snackbarUtils.error(errorProfile);
    }
    if (errorChanged) {
      snackbarUtils.error(errorChanged);
    }
  }, [errorProfile, errorChanged]);

  return (
    <>
      <Head>
        <title>{t('profile:edit.title', { current })}</title>
      </Head>
      <Page {...rest}>
        <ProfileEditComponent
          isAdmin={isAdmin}
          loadingProfile={loadingProfile}
          loadingChanged={loadingChanged}
          profile={current}
          onDrop={onDrop}
          handleChange={handleChange}
          handleBirthday={handleBirthday}
          handleSave={handleSave}
        />
      </Page>
    </>
  );
};

ProfileEditPage.getInitialProps = ({ query }) => ({
  id: query.id,
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileEditPage);
