import { Transform } from 'class-transformer';
import { Equals, IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class PersonalDto {
  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'fullName must be at least 2 characters' })
  @MaxLength(100)
  fullName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254)
  email: string;
}

export class AddressDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'country must be a 2-letter code' })
  country: string;

  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'city must be at least 2 characters' })
  @MaxLength(100)
  city: string;
}

export class ConfirmDto {
  @Equals(true, { message: 'You must accept the terms' })
  acceptTerms: boolean;
}

/** One DTO per step. Adding a step means adding a class here, nothing else on the server. */
export const STEP_DTOS: Record<number, new () => object> = {
  1: PersonalDto,
  2: AddressDto,
  3: ConfirmDto,
};

export const TOTAL_STEPS = Object.keys(STEP_DTOS).length;
