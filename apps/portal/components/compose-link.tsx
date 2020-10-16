/** @format */

//#region Imports NPM
import React from 'react';
import Link, { LinkProps } from '@material-ui/core/Link';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
//#endregion
//#region Imports Local
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rounded: {
      borderRadius: theme.shape.borderRadius,
    },
    link: {
      cursor: 'pointer',
    },
  }),
);

interface UrlProps {
  to?: string | null;
  body?: string;
}

type ComposeLinkProps = UrlProps & LinkProps;

type ComposeButtonProps = UrlProps & ButtonProps & { rounded?: boolean };

const smallWidth = 1200;

const openHandler = ({ to, body }: UrlProps) => {
  let href = `${process.env.MAIL_URL}/?_task=mail&_action=compose`;

  if (to) {
    href += `&_to=${to}`;
  }

  if (body) {
    href += `&body=${body}`;
  }

  const width = Math.min(smallWidth, window.innerWidth);
  const height = window.innerHeight;
  const left = (window.screenLeft || window.screenX) + 20;
  const top = (window.screenTop || window.screenY) + 20;

  window.open(
    href,
    'compose',
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,
    scrollbars=yes,toolbar=no,menubar=no,status=no`,
  );
};

export const ComposeLink: React.FC<ComposeLinkProps> = ({ to, children, body, className, ...rest }) => {
  const classes = useStyles({});

  const handleClick = (event: React.SyntheticEvent): void => {
    event.preventDefault();

    openHandler({ to, body });
  };

  return (
    <Link onClick={handleClick} className={clsx(className, classes.link)} {...rest}>
      {children}
    </Link>
  );
};

export const ComposeButton: React.FC<ComposeButtonProps> = ({ to, children, body, rounded, className, ...rest }) => {
  const classes = useStyles({});

  const handleClick = (): void => {
    openHandler({ to, body });
  };

  return (
    <Button
      color="primary"
      onClick={handleClick}
      className={clsx(className, {
        [classes.rounded]: rounded,
      })}
      {...rest}
    >
      {children}
    </Button>
  );
};
