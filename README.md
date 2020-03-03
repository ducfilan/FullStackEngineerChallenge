# Full Stack Developer Challenge - Paypay Review System

Design a web application that allows employees to submit feedback toward each other's performance review.

![Banner](https://github.com/ducfilan/FullStackEngineerChallenge/blob/master/ReadmeAssets/Banner.PNG?raw=true)
## First run

**Prerequisites**: [Docker](https://www.docker.com) and [Docker-compose](https://docs.docker.com/compose/) are installed.
**First step:**
On the project folder root, run the following command to boot it up:

    docker-compose up

It's up and running at http://localhost:3000
That's all done, no step 2.
Login information:
User with admin role account:

    Username (email): akimi.ishitsuka@paypay.ne.jp
    Password: Pa$$w0rd

Normal employee account:

    duc.hoang@paypay.ne.jp
    Password: Pa$$w0rd

## Project architecture overview

![Architecture Design](https://github.com/ducfilan/FullStackEngineerChallenge/blob/master/ReadmeAssets/ArchitectureDesign.JPG?raw=true)
I separated the system to 2 parts:

 - API server
 - Web server

This allows the system to expand to other platforms (e.g. Mobile App, Desktop App) which comunicates through API server.
The `Web server` will serve web pages and authentication using `API server`'s auth api. This allows setting cookies to client and every request.
`Web server` and `API server` are written in Nodejs

## Database collections

Mongodb is used as Database for its scalability and flexibility. Collections and relationships are describled as the image:

![Database collections](https://github.com/ducfilan/FullStackEngineerChallenge/blob/master/ReadmeAssets/DatabaseDesign.JPG?raw=true)

`(*1)`: In `reviewFactors` collection, it is designed for flexibility. The field `factorResults` are an array of objects of objects. This case `{ factorId: { result } }`, the `factorId` is connected to `_id` field in `reviewFactors` collection; the `result` is an object corresponding to `reviewFactors`'s factors. Example of `reviewFactors`:

    {
      countUnit: '%',
      minValue: 0,
      maxValue: 100,
      inputControl: 'textarea'
    }

and its corresponding `result`: 

    { 
      value: 80,
      detail: 'Completed almost all tasks on time'
    }

In view, there's a `textarea` control for an employee to review other employee with the performace point of 80%.

- The `roles` collection is designed for scalability. When other roles are added and roles' properties are added, this will be flexible.
- Indexes:
For speed, indexes should be used. The default `_id` is ignored.
	- users
		- `users.employeeCode`
		- `users.email`
		- `users.name`
	- reviewRequests
		- `reviewRequests.fromEmail`
		- `reviewRequests.toEmail`
		- `reviewRequests.requesterEmail`
		- `reviewRequests.reviewBoardId`
		- `reviewRequests.status`
	- reviewResults
		- `reviewResults.reviewRequestId`
	- reviewBoards
		- `reviewBoards.title`
		- `reviewBoards.dueDate`
		- 
I created a [seeds file](https://github.com/ducfilan/FullStackEngineerChallenge/blob/master/DB%20seeds%20generator.xlsx) for database with excel formulars. and a small script for generating hashed password with salt:

    'use strict';
    var  crypto  =  require('crypto');
    
    var  genRandomString  =  function(length){
	    return  crypto.randomBytes(Math.ceil(length/2))
	      .toString('hex')
	      .slice(0,length);
    };

    var  sha512  =  function(password,  salt){
	    var  hash  =  crypto.createHmac('sha512',  salt); /** Hashing algorithm sha512 */
	    hash.update(password);
	    var  value  =  hash.digest('hex');
	    
	    return {
	    salt,
	    passwordHash:value
	    };
    };

    function  saltHashPassword(userpassword) {
	    var  salt  =  genRandomString(16); /** Gives us salt of length 16 */
	    var  passwordData  =  sha512(userpassword,  salt);

	    console.log(`hashedPassword: '${passwordData.passwordHash}', salt: '${passwordData.salt}'`);
    }

    for(var  i=0; i  <  51; i++)
	    saltHashPassword('Pa$$w0rd');

## Technologies used
- Server side API:
	- NodeJs
	- Express
	- Mongodb
	- nodemon
	- babel
	- jsonwebtoken
- Web app:
	- NodeJs
	- Express
	- Build system: Gulp with babelify and browserify
	- sass
	- bulma
	- Template engine: Pugjs
	- axios
	- My own developed mechanism for rendering page

## Assumptions

 - English is used, need implement i18n in the future
 - Admin user is also an employee (e.g. manager)
 - Login is using company's email-password mechanism
 - Https should be used (now just http for demo only)
 - An user can delete and can assign review to him/herself (This should be prevented in the future)
 - Performance review use multi-factor assessment (like what I defined)
