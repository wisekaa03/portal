/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import { Badge, Typography, Fab } from '@material-ui/core';
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import BaseDropzone, { DropzoneState } from 'react-dropzone';
import { deepOrange } from '@material-ui/core/colors';
import clsx from 'clsx';
import uuidv4 from 'uuid/v4';
// #endregion
// #region Imports Local
import { DropzoneFile, DropzoneProps } from './types';
import { nextI18next, I18nPage, includeDefaultNamespaces } from '../../lib/i18n-client';
// #endregion

const thumbHeight = 100;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    dropzone: (props: any) => ({
      'alignItems': 'center',
      'backgroundColor': '#fafafa',
      'borderColor': fade(theme.palette[props.color].main, 0.5),
      'borderRadius': '2px',
      'borderStyle': 'dashed',
      'borderWidth': '2px',
      'color': fade(theme.palette[props.color].main, 0.5),
      'display': 'flex',
      'flex': '1',
      'flexDirection': 'column',
      'outline': 'none',
      'padding': '20px',
      'transition':
        `border-color 200ms ${theme.transitions.easing.easeOut} 0ms,` +
        `color 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        borderColor: fade(theme.palette[props.color].main, 0.9),
        color: fade(theme.palette[props.color].main, 0.9),
      },
    }),
    marginBottom: {
      marginBottom: theme.spacing(3),
    },
    img: {
      display: 'block',
      width: 'auto',
      height: '100%',
    },
    thumb: (props: any) => ({
      'display': 'inline-flex',
      'borderRadius': 2,
      'border': `1px solid ${fade(theme.palette[props.color].main, 0.5)}`,
      'marginBottom': theme.spacing(),
      'marginRight': theme.spacing(),
      'width': thumbHeight,
      'height': thumbHeight,
      'padding': theme.spacing() / 2,
      'boxSizing': 'border-box',
      'transition': `border 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        border: `1px solid ${fade(theme.palette[props.color].main, 0.9)}`,
      },
    }),
    thumbsContainer: {
      'display': 'flex',
      'flexDirection': 'row',
      'flexWrap': 'wrap',
      '&:hover $removeBtn': {
        opacity: 1,
      },
    },
    thumbInner: {
      display: 'flex',
      minWidth: 0,
      overflow: 'hidden',
    },
    removeBtn: {
      'background': deepOrange[200],
      'opacity': 0,
      'transition':
        `background 200ms ${theme.transitions.easing.easeOut} 0ms,` +
        `opacity 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        background: deepOrange[300],
      },
    },
    nopreview: {
      textAlign: 'center',
      alignItems: 'center',
      display: 'flex',
    },
    badge: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: thumbHeight + theme.spacing(),
    },
  }),
);

const NO_PREVIEW = 'no_preview';

const Dropzone: I18nPage<DropzoneProps> = ({
  t,
  files,
  setFiles,
  filesLimit,
  acceptedFiles,
  maxFileSize,
  color = 'primary',
  ...rest
}): React.ReactElement => {
  const classes = useStyles({ color });
  const [error, setError] = useState<string[]>([]);

  const updateError = (value?: string): void => setError(value ? [...error, value] : []);

  const onDrop = (newFiles: DropzoneFile[]): void => {
    if (newFiles.length > filesLimit) {
      updateError(t('dropzone:filesLimit'));

      return;
    }

    updateError();

    setFiles((state) => [
      ...state,
      ...newFiles.map((file) => ({
        ...file,
        id: uuidv4(),
        preview: file.type.includes('image') ? URL.createObjectURL(file) : NO_PREVIEW,
      })),
    ]);
  };

  const handleDelete = (index: string) => (): void => {
    updateError();
    setFiles(files.filter((file) => file.id !== index));
  };

  const handleDropRejected = (rejectedFiles: DropzoneFile[]): void => {
    updateError();

    rejectedFiles.forEach((rejectedFile) => {
      if (!acceptedFiles.includes(rejectedFile.type)) {
        updateError(t('dropzone:acceptedFiles'));
      }

      if (rejectedFile.size > maxFileSize) {
        updateError(t('dropzone:maxFileSize'));
      }
    });
  };

  // useEffect(() => {
  //   return () => {
  //     files.forEach((file) => URL.revokeObjectURL(file.preview));
  //   };
  // }, [files]);

  return (
    <BaseDropzone
      onDrop={onDrop}
      onDropRejected={handleDropRejected}
      maxSize={maxFileSize}
      accept={acceptedFiles.join(',')}
      {...rest}
    >
      {(state: DropzoneState) => (
        <section className={classes.container}>
          <div
            {...state.getRootProps({
              className: clsx(classes.dropzone, {
                [classes.marginBottom]: files.length > 0,
              }),
            })}
          >
            <input {...state.getInputProps()} />
            <p>{t('dropzone:attach')}</p>
          </div>
          <aside className={classes.thumbsContainer}>
            {files.map((file, index) => (
              <Badge
                key={file.id}
                className={classes.badge}
                badgeContent={
                  <Fab size="small" className={classes.removeBtn} onClick={handleDelete(file.id)}>
                    <DeleteIcon />
                  </Fab>
                }
              >
                <>
                  <div className={classes.thumb}>
                    <div className={classes.thumbInner}>
                      {file.preview === NO_PREVIEW ? (
                        <Typography className={classes.nopreview} variant="h6">
                          {t('dropzone:nopreview')}
                        </Typography>
                      ) : (
                        <img src={file.preview} className={classes.img} alt={t('dropzone:nopreview')} />
                      )}
                    </div>
                  </div>
                  <span>{file.name}</span>
                </>
              </Badge>
            ))}
          </aside>
        </section>
      )}
    </BaseDropzone>
  );
};

Dropzone.defaultProps = {
  acceptedFiles: ['image/*'],
  filesLimit: 5,
  maxFileSize: 3000000,
};

Dropzone.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['dropzone']),
});

export default nextI18next.withTranslation('dropzone')(Dropzone);
