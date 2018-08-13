Run `$ docker-compose up` in a terminal.  
In a new terminal run `$ docker exec -it ts-test-bug bash` then in the container bash:  
- `$ yarn install`
- `$ yarn test`

The coverage will fail.  
Change back to version 23.0.1 it will work.  
ANY version after 23.0.1 breaks the coverage.