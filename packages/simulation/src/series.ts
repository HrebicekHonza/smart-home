export function at<T>(values: readonly T[], index: number): T {
	const value = values[index];
	if (value === undefined)
		throw new RangeError(`Index ${index} is outside 0..${values.length - 1}`);
	return value;
}

export function last<T>(values: readonly T[]): T {
	return at(values, values.length - 1);
}
