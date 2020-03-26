/** @format */

// #region Imports NPM
import React from 'react';
import Typography from '@material-ui/core/Typography';
// #endregion
// #region Imports Local
import { I18nPage, includeDefaultNamespaces, nextI18next } from '@lib/i18n-client';
import { VerticalCenter } from '@front/components/verticalcenter';
// #endregion

// #region Imports Local
// #endregion

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     loading: {
//       color: 'red',
//     },
//     margin: {
//       margin: theme.spacing(2),
//     },
//   }),
// );

const Wait: I18nPage = ({ t }) => {
  // const classes = useStyles({});

  return (
    <VerticalCenter>
      <Typography display="block" variant="h2" component="h2">
        {t('common:wait')}
      </Typography>
    </VerticalCenter>
  );
};

Wait.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces([]),
  };
};

export default nextI18next.withTranslation()(Wait);
