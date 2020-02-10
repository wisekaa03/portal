/** @format */

// #region Imports NPM
import React, { useEffect, useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, IconButton, RadioGroup, FormControlLabel, Radio, Typography } from '@material-ui/core';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DirectoryIcon from '@material-ui/icons/Folder';
import DirectorySharedIcon from '@material-ui/icons/FolderShared';
import FileIcon from '@material-ui/icons/Note';
// #endregion
// #region Imports Local
import Button from '../../components/common/button';
import Page from '../../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { MEDIA_EDIT, MEDIA } from '../../lib/queries';
import { Loading } from '../../components/loading';
import { Media } from '../../src/media/models/media.dto';
import Dropzone from '../../components/dropzone';
import { DropzoneFile } from '../../components/dropzone/types';
// #endregion

declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
  labelText: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropBox: {
      padding: '0 20px 0 20px',
    },

    firstBlock: {
      display: 'grid',
      gridGap: theme.spacing(2),
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },

    sharedOrUser: {
      flexDirection: 'row',
    },

    treeView: {
      textAlign: 'left',
    },
  }),
);

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      'color': theme.palette.text.secondary,
      '&:focus > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
        color: 'var(--tree-view-color)',
      },
    },
    content: {
      'color': theme.palette.text.secondary,
      'borderTopRightRadius': theme.spacing(2),
      'borderBottomRightRadius': theme.spacing(2),
      'paddingRight': theme.spacing(1),
      'fontWeight': theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      'marginLeft': 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    label: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

const StyledTreeItem = (props: StyledTreeItemProps) => {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
};

const MediaEdit: I18nPage = ({ t, ...rest }): React.ReactElement => {
  // eslint-disable-next-line no-debugger
  // debugger;

  const classes = useStyles({});
  const [getMedia, { loading, error, data }] = useLazyQuery(MEDIA);
  const [mediaEdit] = useMutation(MEDIA_EDIT);
  const router = useRouter();

  const [title, setTitle] = useState<string | undefined>();
  const [current, setCurrent] = useState<Media | undefined>();
  const [updated, setUpdated] = useState<Media | undefined>();

  const [attachments, setAttachments] = useState<DropzoneFile[]>([]);

  useEffect(() => {
    if (router && router.query && router.query.id) {
      const id = router.query.id as string;
      getMedia({
        variables: { id },
      });
      setUpdated({ id } as any);
      setTitle('media:edit.title');
    } else {
      setCurrent(undefined);
      setTitle('media:add.title');
    }
  }, [title, getMedia, router]);

  useEffect(() => {
    if (!loading && !error && data && data.media) {
      setCurrent(data.media);
    }
  }, [loading, data, error]);

  const handleUpload = (): void => {
    attachments.forEach((file: DropzoneFile) => {
      mediaEdit({
        variables: {
          ...updated,
          attachment: file.file,
        },
      });
    });
  };

  return (
    <>
      <Head>
        <title>{t(title)}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <>
            {!current ? (
              <Loading noMargin type="linear" variant="indeterminate" />
            ) : (
              <>
                <Box display="flex" flexDirection="column" p={2} overflow="auto">
                  <Box display="flex" mb={1}>
                    <Link href={{ pathname: '/media' }} as="/media" passHref>
                      <IconButton>
                        <ArrowBackIcon />
                      </IconButton>
                    </Link>
                    <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
                      <Button onClick={handleUpload}>{t(title)}</Button>
                    </Box>
                  </Box>
                </Box>
                <Box display="flex" className={classes.dropBox} flexDirection="row">
                  <RadioGroup
                    defaultValue="0"
                    className={classes.sharedOrUser}
                    aria-label={t('media:control.sharedOrUser')}
                    name="sharedOrUser"
                  >
                    <FormControlLabel value="0" control={<Radio />} label={t('media:control.shared')} />
                    <FormControlLabel value="1" control={<Radio />} label={t('media:control.user')} />
                  </RadioGroup>
                </Box>
                <Box display="flex" className={classes.dropBox} flexDirection="column">
                  <TreeView className={classes.treeView}>
                    <StyledTreeItem nodeId="1" labelText="Directory" labelIcon={DirectoryIcon} />
                    <StyledTreeItem nodeId="2" labelText="Directory" labelIcon={DirectoryIcon} />
                  </TreeView>
                </Box>
                <Box display="flex" className={classes.dropBox} flexDirection="column">
                  <Dropzone setFiles={setAttachments} files={attachments} {...rest} />
                </Box>
              </>
            )}
          </>
        </Box>
      </Page>
    </>
  );
};

MediaEdit.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['media']),
});

export default nextI18next.withTranslation('media')(MediaEdit);
