/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import { Badge, Typography, Fab } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
// import BaseDropzone from 'react-dropzone';
// #endregion
// #region Imports Local
import { nextI18next, I18nPage, includeDefaultNamespaces } from '../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
  }),
);

const Dropzone: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});

  return <div />;
};

Dropzone.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['dropzone']),
});

export default nextI18next.withTranslation('dropzone')(Dropzone);
