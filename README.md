Environment Setup
==================

You need setup node and npm in your local environment first.


Startup
--------

```
    npm install
```

```
    npm start
```

Description of Contents
------------------------

The default directory structure:

    |-- public
    |   |-- images
    |   |-- javascripts 
    |   |-- partials
    |   |-- stylesheets
    |   `-- vendor       
    |-- routes
    |   |-- json
    |-- views
    |   |-- partials
    |   `-- tempaltes
    |-- app.js
    |-- package.json
    |-- README.md
 
**public**
    Holds all the code that's specific to this particular application.

**public/vendor**
    Third parties libs, angular, bootstrap, jquery, for example. File types contain js, css, png.  

**routes**
    app.js requires routing functions and mockup return data under json directory.
  
**views**
    contains default index page and another layout.
  
**node_modules**
    nodejs related modules.

**app.js**
    app configuration, routing, and then startup.

**package.json**
    project description file.
