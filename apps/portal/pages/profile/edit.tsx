/** @format */

//#region Imports NPM
import type { Request } from 'express';
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import type { NextPageContext } from 'next';
import Head from 'next/head';
import { useQuery, useMutation } from '@apollo/client';
import { format as dateFnsFormat } from 'date-fns';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { PROFILE, CHANGE_PROFILE } from '@lib/queries';
import type { UserContext, Data, Profile, ProfileInput } from '@lib/types';
import { resizeImage } from '@lib/utils';
import { ProfileContext } from '@lib/context';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import ProfileEditComponent from '@front/components/profile/edit';
//#endregion

const ProfileEditPage: I18nPage<{ ctx: NextPageContext }> = ({ t, i18n, query, ctx, ...rest }) => {
  const [current, setCurrent] = useState<Profile | undefined>();
  const [updated, setUpdated] = useState<Partial<Profile> | undefined>();
  const [thumbnailPhoto, setThumbnail] = useState<File | undefined>();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = __SERVER__ ? (ctx.req as Request)?.session?.passport || { user: null } : useContext(ProfileContext);
  const id = query?.id || user?.profile?.id;
  const isAdmin = user?.isAdmin ?? false;

  const { loading: loadingProfile, error: errorProfile, data: dataProfile, refetch: refetchProfile } = useQuery<Data<'profile', Profile>>(
    PROFILE,
    {
      variables: { id },
      // TODO: check if this is available
      ssr: false,
      context: { user },
      notifyOnNetworkStatusChange: true,
    },
  );

  const [changeProfile, { loading: loadingChanged, error: errorChanged }] = useMutation<Data<'changeProfile', ProfileInput>>(
    CHANGE_PROFILE,
    {
      refetchQueries: [
        {
          query: PROFILE,
          variables: { id },
        },
      ],
      awaitRefetchQueries: true,
    },
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

  const handleChange = (name: keyof Profile) => (event: React.ChangeEvent<Element>, changedValue?: unknown) => {
    const element = event.target as HTMLInputElement;
    const value = changedValue || (element.type === 'checkbox' ? element.checked : element.value);

    if (isAdmin && current && updated) {
      const result = name === 'gender' ? parseInt(value as string, 10) : value;
      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result });
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
      return !!thumbnailPhoto;
    }
    return !!updated || !!thumbnailPhoto;
  }, [loadingChanged, thumbnailPhoto, updated]);

  return (
    <>
      <Head>
        <title>{t('profile:edit.title', { current: current?.fullName })}</title>
      </Head>
      <MaterialUI refetchComponent={refetchProfile} {...rest}>
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
          language={i18n.language}
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
