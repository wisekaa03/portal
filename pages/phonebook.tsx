/** @format */
/* eslint prettier/prettier:0 */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Modal,
} from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon } from '@material-ui/icons';
import uuidv4 from 'uuid/v4';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { I18nPage, useTranslation, includeDefaultNamespaces } from '../lib/i18n-client';
import { Order, ColumnNames, Column } from '../components/phonebook/types';
import { ProfileComponent } from '../components/phonebook/profile';
import { SettingsComponent, allColumns } from '../components/phonebook/settings';
import { appBarHeight } from '../components/app-bar';
// import useDebounce from '../lib/debounce';
import { Profile } from '../server/profile/models/profile.dto';
import { Loading } from '../components/loading';
import { Avatar } from '../components/avatar';
import { PROFILE } from '../lib/queries';
// #endregion

const panelHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    panel: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F7FBFA',
      height: panelHeight,
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    table: { height: `calc(100vh - ${appBarHeight}px - ${panelHeight}px)`, overflow: 'auto' },
    search: {
      'flexGrow': 1,
      'position': 'relative',
      'borderRadius': theme.shape.borderRadius,
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      'marginRight': theme.spacing(2),
      'marginLeft': 0,
      'width': '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
    // buttonExtended: {
    //   borderRadius: '87px',
    //   backgroundColor: '#DEECEC',
    // },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

// const defaultColumns: Column[] = [
//   {
//     id: 'photo',
//     label: '',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'name',
//     label: 'Ф.И.О.',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'company',
//     label: 'Компания',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'division',
//     label: 'Подразделение',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'position',
//     label: 'Должность',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'telephone',
//     label: 'Рабочий телефон',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'inside_phone',
//     label: 'Внут. тел.',
//     minWidth: 100,
//     show: true,
//   },
//   {
//     id: 'email',
//     label: 'Электронная почта',
//     minWidth: 100,
//     show: true,
//   },
// ];

const defaultColumns: ColumnNames[] = [
  'thumbnailPhoto',
  'name',
  'company',
  'department',
  'title',
  'mobile',
  'telephone',
  'workPhone',
];

// const createData = (profiles: FetchProps[]): BookProps[] => {
//   if (!profiles || profiles.length === 0) return [];
//   const result: BookProps[] = [];

//   profiles.forEach((p) => {
//     result.push({
//       id: p.id,
//       name: `${p.lastName} ${p.firstName} ${p.middleName}`,
//       name_en: '',
//       login: 'ivanov',
//       thumbnailPhoto: '',
//       company: `Компания ${i}`,
//       company_en: `Company ${i}`,
//       department: 'Департамент',
//       department_en: 'Department',
//       division: `Подразделение ${i}`,
//       division_en: `Division ${i}`,
//       position: 'Слесарь',
//       position_en: 'Mechanic',
//       supervisor: 'Петров Петр Петрович',
//       room: '111',
//       telephone: '+7 918 1111111',
//       fax: '+7 918 2222222',
//       mobile_phone: '+7 918 3333333',
//       inside_phone: `00${i < 10 ? 0 : ''}${i}`,
//       email: 'webmaster@kngk-group.ru',
//       country: 'Россия',
//       region: 'Краснодарский край',
//       city: 'Краснодар',
//       address: 'Красная',
//     });
//   });

//   return result;
// };

// const sortData = (order: Order, orderBy: ColumnNames) => (a: BookProps, b: BookProps) => {
//   const asc: number = order === 'asc' ? 1 : -1;

//   return a[orderBy] > b[orderBy] ? asc * 1 : a[orderBy] < b[orderBy] ? asc * -1 : 0;
// };

const getColumns = (columns: ColumnNames[]): string => {
  let result = '';
  const addressColumns = ['country', 'postalCode', 'region', 'street'];

  const addressPersonal = columns.filter((col) => addressColumns.includes(col));

  columns.forEach((col) => {
    if (col === 'name') {
      result += 'firstName lastName middleName ';
    } else if (!addressColumns.includes(col)) {
      result += `${col} `;
    }
  });

  if (addressPersonal.length > 0) {
    result += `addressPersonal { ${addressPersonal.map((col) => `${col} `)} }`;
  }

  return result;
};

const getRows = (
  profile: Profile,
  columns: ColumnNames[],
  onClick: (fetchProps: Profile) => () => void,
): React.ReactNode => (
  <TableRow key={uuidv4()} hover onClick={onClick(profile)}>
    {allColumns
      .filter((col) => columns.includes(col))
      .map((col) => {
        let cellData: React.ReactElement | string | null = null;

        switch (col) {
          case 'thumbnailPhoto': {
            cellData = <Avatar profile={profile} />;
            break;
          }

          case 'name': {
            const { firstName, lastName, middleName } = profile;
            cellData = `${lastName || ''} ${firstName || ''} ${middleName || ''}`;
            break;
          }

          case 'mobile':
          case 'telephone':
          case 'workPhone':
          case 'company':
          case 'department':
          case 'title': {
            cellData = profile[col];
            break;
          }

          default: {
            break;
          }
        }
        return <TableCell key={col}>{cellData}</TableCell>;
      })}
  </TableRow>
);

const PhoneBook = (): React.ReactElement => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<ColumnNames>('name');
  const [columns, setColumns] = useState<ColumnNames[]>(defaultColumns);
  const [search, setSearch] = useState<string>('');

  const [profileOpen, setProfileOpen] = useState<Profile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const { loading, error, data, fetchMore } = useQuery(PROFILE(getColumns(columns)), {
    variables: {
      take: 20,
      skip: 0,
    },
  });

  if (loading) {
    return <Loading type="linear" variant="indeterminate" />;
  }

  console.log(data);

  const handleRequestSort = (_: React.MouseEvent<unknown>, property: ColumnNames): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: ColumnNames) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleProfileOpen = (props: Profile) => (): void => {
    setProfileOpen(props);
  };

  const handleProfileClose = (): void => {
    setProfileOpen(null);
  };

  const handleSettingsOpen = (): void => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = (): void => {
    setSettingsOpen(false);
  };

  const profileId = profileOpen ? 'profile' : undefined;
  const settingsId = settingsOpen ? 'settings' : undefined;

  // const debouncedSearch = useDebounce(search, 500);

  // useEffect(() => {
  //   setBookData(
  //     bookData.filter((data) => {
  //       if (debouncedSearch.length <= 3) {
  //         return true;
  //       }
  //       const s = debouncedSearch.toLocaleLowerCase();
  //       const check = (c) => c.toLowerCase().includes(s);
  //       console.log(debouncedSearch.length);
  //       return check(data.name) || check(data.inside_phone);
  //     }),
  //   );
  // }, [bookData, debouncedSearch]);

  return (
    <>
      <Page>
        <div className={classes.root}>
          <div className={classes.panel}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Быстрый поиск"
                value={search}
                onChange={handleSearch}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
            {/* <Button variant="contained" className={classes.buttonExtended}>
              Расширенный поиск
              </Button> */}
            <IconButton onClick={handleSettingsOpen}>
              <SettingsIcon />
            </IconButton>
          </div>
          <div id="phonebook-wrap" className={classes.table}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.includes('thumbnailPhoto') ? <TableCell /> : null}
                  {allColumns
                    .filter((c) => c !== 'thumbnailPhoto' && columns.includes(c))
                    .map((column) => (
                      <TableCell
                        key={column}
                        // align={column.align}
                        sortDirection={orderBy === column ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === column}
                          direction={order}
                          onClick={createSortHandler(column)}
                        >
                          {t(`phonebook:fields.${column}`)}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* bookData.sort(sortData(order, orderBy)).map((a) => getRows(a, columns)) */ null}
                {!loading && data.profiles.map((p: Profile) => getRows(p, columns, handleProfileOpen))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Page>
      <Modal
        id={profileId}
        disableAutoFocus
        open={Boolean(profileOpen)}
        onClose={handleProfileClose}
        className={classes.modal}
      >
        <ProfileComponent profile={profileOpen} handleClose={handleProfileClose} />
      </Modal>
      <Modal
        id={settingsId}
        disableAutoFocus
        open={settingsOpen}
        onClose={handleSettingsClose}
        className={classes.modal}
      >
        <SettingsComponent columns={columns} changeColumn={setColumns} handleClose={handleSettingsClose} />
      </Modal>
    </>
  );
};

PhoneBook.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['phonebook']),
  };
};

export default PhoneBook;
