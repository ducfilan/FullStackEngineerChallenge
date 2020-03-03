
## leanlearn API
### Docker configuration:
#### Requirements:
- docker
- docker-compose
#### Installation:
- Mac OS: https://docs.docker.com/docker-for-mac/install/
- Windows (not verified): https://docs.docker.com/docker-for-windows/install/
- Ubuntu: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04, https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
#### Steps:
- Create an `.env` file to config database information:
	```bash
	MONGO_USERNAME=[your-mongodb-username]
	MONGO_PASSWORD=[your-mongodb-password]
	MONGO_PORT=27017
	MONGO_DB=[your-mongodb-database-name]
	NODE_PORT=8080
	// Google authentication application config, get from https://manage.auth0.com/dashboard/us/<your-account-name>/applications
	AUTH0_CLIENT_ID=[your-client-id]
	AUTH0_DOMAIN=[your-google-authen-app-domain]   
	AUTH0_CLIENT_SECRET=[your-client-secret]
	AUTH0_CALLBACK_URL=[call-back-url]
	JWK_URI=[your-google-authen-url].well-known/jwks.json
	JWK_AUDIENCE=[your-application-url]
	JWK_ISSUER=[your-google-authen-url]
	```
- Run `docker-compose up` from terminal
#### Usage:
- Run bash in docker container:

	`docker exec -it <container name>`

