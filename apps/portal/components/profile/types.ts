/** @format */

import { ApolloQueryResult } from 'apollo-client';

import { Profile } from '../../src/profile/models/profile.dto';
import { OldUser, OldTicket } from '../../src/ticket/old-service/models/old-service.interface';
import { Data } from '../../lib/types';
import { DropzoneFile } from '../dropzone/types';

export interface ProfileTicketsComponentProps {
  loading: boolean;
  tickets: OldTicket[];
  status: string;
  search: string;
  refetchTickets: () => Promise<ApolloQueryResult<Data<'OldTickets', OldTicket[]>>>;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ProfileTicketsCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  ticket: OldTicket;
}

export interface ProfileTicketComponentProps {
  loading: boolean;
  loadingEdit: boolean;
  ticket: OldTicket;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleComment: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleAccept: () => void;
  handleClose: () => void;
}

export interface ProfileTicketInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  profile: OldUser;
}

export interface ProfileEditComponentProps {
  isAdmin: boolean;
  loadingProfile: boolean;
  loadingChanged: boolean;
  hasUpdate: boolean;
  profile?: Profile;
  onDrop: (_: any) => Promise<void>;
  handleChange: (_: keyof Profile, ___?: string) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  handleBirthday: (_: Date | null) => void;
  handleSave: () => void;
}

export interface TextFieldComponentProps {
  disabled: boolean;
  handleChange: (_: keyof Profile, ___?: string) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  field: keyof Profile;
  value?: any;
  InputProps: any;
}
