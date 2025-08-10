# Configuration & Run

1. Create a .env file following the .env.example and replacing with appropriate values
2. Spin up the dev db container using this script<br> `db:dev:restart`
3. Check the logs to see if database system is ready to accept connections uing<br>
   `docker logs $(docker ps -qf "name=dev-db")`<br>
   In case the name of the dev-db container is changed, search manually using docker ps and then paste the container id in the following command<br>
   `docker logs <container_id>`
4. Running `npx prisma studio` opens the prisma GUI for interacting with the db by connnecting to the db using the string in the .env file
5. Run the app in watch mode using the script <br>`npm run start:dev`
6. Swagger is available at the url available in the console log, normally it should be<br>`http://localhost:<port>/api/docs`