// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
    production: false,
    region: 'us-east-1',
    identityPoolId: 'us-east-1:12c9a862-6372-44b1-8d00-1cbc3cf9ecee',
    userPoolId: 'us-east-1_IgJazFRFw',
    clientId: '2uibrupe8tmciu8u2teddckohb',
    validRoles: ['admin', 'doctor', 'family_members', 'caregiver'],
    rekognitionBucket: 'tethercare-staging',
    albumName: "profilepng",
    bucketRegion: 'us-east-1'
};
