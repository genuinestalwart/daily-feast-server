import { Transform } from 'class-transformer';

export const TrimArray = () =>
	Transform(({ value }) =>
		Array.isArray(value) ? value.map((tag: string) => tag.trim()) : value,
	);
