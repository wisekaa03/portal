/** @format */

//#region Imports NPM
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { PROFILE, CHANGE_PROFILE, CURRENT_USER } from '@lib/queries';
import { resizeImage } from '@lib/utils';
import { ProfileContext } from '@lib/context';
import { format } from '@lib/dayjs';
import snackbarUtils from '@lib/snackbar-utils';
import { Profile } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileEditComponent from '@front/components/profile/edit';
//#endregion

const ProfileEditPage: I18nPage = ({ t, query, ...rest }): React.ReactElement => {
  const [current, setCurrent] = useState<Profile | undefined>();
  const [updated, setUpdated] = useState<Profile | undefined>();
  const [thumbnailPhoto, setThumbnail] = useState<File | undefined>();

  const { user } = useContext(ProfileContext);
  const id = query?.id || user?.profile?.id;
  const { isAdmin } = user || { isAdmin: false };

  const { loading: loadingProfile, error: errorProfile, data: dataProfile } = useQuery(PROFILE, {
    variables: { id },
  });

  const changeProfileRefetchQueries =
    id === user?.profile?.id
      ? {
          refetchQueries: [
            {
              query: PROFILE,
              variables: { id },
            },
            {
              query: CURRENT_USER,
            },
          ],
          awaitRefetchQueries: true,
        }
      : {
          refetchQueries: [
            {
              query: PROFILE,
              variables: { id },
            },
          ],
          awaitRefetchQueries: true,
        };

  const [changeProfile, { loading: loadingChanged, error: errorChanged }] = useMutation(
    CHANGE_PROFILE,
    changeProfileRefetchQueries,
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (current && acceptedFiles.length > 0) {
        setThumbnail(acceptedFiles[0]);
        setCurrent({ ...current, thumbnailPhoto: (await resizeImage(acceptedFiles[0])) as string });
      }
    },
    [current],
  );

  const handleChange = (name: keyof Profile, value_?: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const element: EventTarget & HTMLInputElement = event.target;
    const value: string | boolean | number = value_ || (element.type === 'checkbox' ? element.checked : element.value);

    if (isAdmin && current && updated) {
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
    changeProfile({
      variables: {
        profile: updated,
        thumbnailPhoto,
      },
    });
  };

  useEffect(() => {
    if (isAdmin && id) {
      if (dataProfile) {
        setCurrent(dataProfile.profile);
        setUpdated({ id } as Profile);
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

  const hasUpdate = useMemo<boolean>(() => {
    if (loadingChanged) {
      return true;
    }
    if (updated && Object.keys(updated).length === 1 && updated.id) {
      return false;
    }
    return !!updated || !!thumbnailPhoto;
  }, [loadingChanged, thumbnailPhoto, updated]);

  return (
    <>
      <Head>
        <title>{t('profile:edit.title', { current: current?.fullName })}</title>
      </Head>
      <MaterialUI {...rest}>
        <ProfileEditComponent
          isAdmin={isAdmin}
          loadingProfile={loadingProfile}
          loadingChanged={loadingChanged}
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
