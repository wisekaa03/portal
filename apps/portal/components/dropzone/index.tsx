/** @format */

//#region Imports NPM
import React, { FC, useState, useEffect } from 'react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import BaseDropzone, { DropzoneState, useDropzone, FileRejection } from 'react-dropzone';
import { Badge, Typography, Fab, Tooltip } from '@material-ui/core';
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { deepOrange } from '@material-ui/core/colors';
//#endregion
//#region Imports Local
import { nextI18next, useTranslation } from '@lib/i18n-client';
import { DropzoneFile, DropzoneProps } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
//#endregion

const thumbHeight = 100;

interface DropzoneStyle {
  color: 'primary' | 'secondary';
  border: 'full' | 'top' | 'left' | 'right' | 'bottom';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    dropzone: (props: DropzoneStyle) => ({
      'alignItems': 'center',
      'backgroundColor': '#F5FDFF',
      'borderRadius': theme.shape.borderRadius,
      'color': '#31312F',
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

      'borderTopColor':
        props.border === 'full' || props.border === 'top' ? fade(theme.palette[props.color].main, 0.5) : 'transparent',
      'borderTopStyle': props.border === 'full' || props.border === 'top' ? 'dashed' : 'none',
      'borderTopWidth': props.border === 'full' || props.border === 'top' ? '2px' : 0,

      'borderLeftColor':
        props.border === 'full' || props.border === 'left' ? fade(theme.palette[props.color].main, 0.5) : 'transparent',
      'borderLeftStyle': props.border === 'full' || props.border === 'left' ? 'dashed' : 'none',
      'borderLeftWidth': props.border === 'full' || props.border === 'left' ? '2px' : 0,

      'borderRightColor':
        props.border === 'full' || props.border === 'right'
          ? fade(theme.palette[props.color].main, 0.5)
          : 'transparent',
      'borderRightStyle': props.border === 'full' || props.border === 'right' ? 'dashed' : 'none',
      'borderRightWidth': props.border === 'full' || props.border === 'right' ? '2px' : 0,

      'borderBottomColor':
        props.border === 'full' || props.border === 'bottom'
          ? fade(theme.palette[props.color].main, 0.5)
          : 'transparent',
      'borderBottomStyle': props.border === 'full' || props.border === 'bottom' ? 'dashed' : 'none',
      'borderBottomWidth': props.border === 'full' || props.border === 'bottom' ? '2px' : 0,
    }),
    marginBottom: {
      marginBottom: theme.spacing(3),
    },
    img: {
      display: 'block',
      width: 'auto',
      height: '100%',
    },
    thumb: (props: DropzoneStyle) => ({
      'display': 'inline-flex',
      'borderRadius': 2,
      'border': `1px solid ${fade(theme.palette[props.color].main, 0.5)}`,
      'marginBottom': theme.spacing(),
      'marginRight': theme.spacing(),
      'width': thumbHeight,
      'height': thumbHeight,
      'padding': theme.spacing(0.5),
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
    name: {
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }),
);

export const DropzoneWrapper: FC<{ onDrop: (acceptedFiles: File[]) => Promise<void> }> = ({ onDrop, children }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

const NO_PREVIEW = 'no_preview';

const Dropzone: FC<DropzoneProps> = ({
  files,
  setFiles,
  filesLimit = 50,
  acceptedFiles = [
    '.xlsx',
    '.docx',
    '.pptx',
    '.rar',
    '.zip',
    '.pdf',
    '.xls',
    '.doc',
    '.ppt',
    'text/*',
    'image/*',
    'video/*',
    'audio/*',
  ],
  color = 'primary',
  mode = 'full',
  className,
  children,
  border = 'full',
  maxFileSize,
}): React.ReactElement => {
  const classes = useStyles({ color, border });
  const { t } = useTranslation();
  const [errors, setErrors] = useState<string[]>([]);

  if (!maxFileSize) {
    maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || '250000000', 10);
  }

  const updateError = (value?: string): void => setErrors(value ? [...errors, value] : []);

  const onDrop = (newFiles: File[]): void => {
    if (newFiles.length > filesLimit) {
      updateError(t('dropzone:filesLimit'));

      return;
    }

    updateError();

    setFiles((state) => [
      ...state,
      ...newFiles.map((file) => ({
        file,
        id: uuidv4(),
        preview: file.type.includes('image') ? URL.createObjectURL(file) : NO_PREVIEW,
      })),
    ]);
  };

  const handleDelete = (index: string) => (): void => {
    updateError();
    setFiles(files.filter((file) => file.id !== index));
  };

  const handleDropRejected = (rejectedFiles: FileRejection[]): void => {
    updateError();

    rejectedFiles.forEach((rejectedFile) => {
      if (!acceptedFiles.includes(rejectedFile.file.type)) {
        updateError(t('dropzone:acceptedFiles'));
      }

      if (maxFileSize && rejectedFile.file.size > maxFileSize) {
        updateError(t('dropzone:maxFileSize'));
      }
    });
  };

  useEffect(() => {
    errors.forEach((error) => snackbarUtils.error(error));
  }, [errors]);

  if (mode === 'drop') {
    return (
      <BaseDropzone onDrop={onDrop} onDropRejected={handleDropRejected} maxSize={maxFileSize} accept={acceptedFiles}>
        {({ getRootProps, getInputProps }: DropzoneState) => (
          <div {...getRootProps({ className })}>
            <input {...getInputProps()} />
            {children}
          </div>
        )}
      </BaseDropzone>
    );
  }

  return (
    <BaseDropzone onDrop={onDrop} onDropRejected={handleDropRejected} maxSize={maxFileSize} accept={acceptedFiles}>
      {({ getRootProps, getInputProps }: DropzoneState) => (
        <section className={clsx(className, classes.container)}>
          <div
            {...getRootProps({
              className: clsx(classes.dropzone, {
                [classes.marginBottom]: files?.length > 0,
              }),
            })}
          >
            <input {...getInputProps()} />
            <p>{t('dropzone:attach')}</p>
          </div>
          {mode === 'full' && (
            <aside className={classes.thumbsContainer}>
              {files.map((element: DropzoneFile) => (
                <Badge
                  key={element.id}
                  className={classes.badge}
                  badgeContent={
                    <Fab size="small" className={classes.removeBtn} onClick={handleDelete(element.id)}>
                      <DeleteIcon />
                    </Fab>
                  }
                >
                  <>
                    <div className={classes.thumb}>
                      <div className={classes.thumbInner}>
                        {element.preview === NO_PREVIEW ? (
                          <Typography className={classes.nopreview} variant="h6">
                            {t('dropzone:nopreview')}
                          </Typography>
                        ) : (
                          <img src={element.preview} className={classes.img} alt={t('dropzone:nopreview')} />
                        )}
                      </div>
                    </div>
                    <Tooltip title={element.file.name}>
                      <span className={classes.name}>{element.file.name}</span>
                    </Tooltip>
                  </>
                </Badge>
              ))}
            </aside>
          )}
        </section>
      )}
    </BaseDropzone>
  );
};

export default nextI18next.withTranslation('dropzone')(Dropzone);
