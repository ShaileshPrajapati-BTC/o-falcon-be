# Rohak Phase 2
### for development
to run backend `cd server && node app.js`
to run frontend `cd client && npm run start`

you will have to run yarn build in client folder every time you update the client code

## pm2 process start
#### for staging
export NODE_ENV=staging && pm2 start app.js --name=rohak-staging

#### for production
export NODE_ENV=production && pm2 start app.js --name=rohak-production

npm run start
