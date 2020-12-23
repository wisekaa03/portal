/** @format */

import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '@back/shared/Paginated';
import { Profile } from '../profile.entity';

@ObjectType()
export class PaginatedProfile extends Paginated(Profile) {}
