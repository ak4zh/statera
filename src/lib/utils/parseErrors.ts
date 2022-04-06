const knownErrors = {
	account_groups_organization_id_slug_key:
		'A group with that name already exists, please use a different name.'
};

export const parseError = (error) =>
	knownErrors[Object.keys(knownErrors).find((a) => error.message.includes(a))] ||
	'Something went wrong.';
