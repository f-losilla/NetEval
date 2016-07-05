NetEval 

NetEval is web-based educational tool for the design of wireless networking projects and their assement. The teacher can define problems to the students and they must design a network that meet several restrictions defined in the problem. Once the network is designed, students can get feedback from their design mistakes in order to correct them.

INSTALLATION & USE:
1. In the server, install and start the MongoDB daemon: https://docs.mongodb.com/manual/installation/
2. Install node.js: https://nodejs.org/
3. Copy the project to a new directory in the server
4. Inside the directory run: 
    node app.js
5. Connect using Google Chrome to the IP/domain name of the server
    If you have problems running the server (for example, if there is another web server on the machine) try changing the TCP port in app.js from process.env.PORT to another port (e.g. 8080)
    If you change the port you will have to access to the following URL: http://<domain/IP>:<new_port>/
6. Create an admin account. 
    Create a new user called admin. Don't lose the password
    If you forget the password you will have to use the mongodb shell to delete this user or give another user admin access
7. Students can create their accounts and access the sample exercises, create networks, evaluate them and receive feedback from their design mistakes.
8. You can upload new exercises by modifying the template.ejs pattern file (found in the uploads directory). Save the file with a different name, log in as admin and upload it. A new resource will be created on the server for the exercise (its URL will be formed using 'challenges/' + the name of the file without extension).
    In addition to renaming the ejs file, you should specify a title, short description,a challenge group. This information will be stored in the database and can be used in the future to render dynamic web pages where exercises are grouped.
    Currently the home page is static, but dynamic web pages or sections in the home page could be used to present all the exercises of a same group.

TODO: There is some code cleaning and commenting pending, as well as more testing of the latest changes (mostly translation). 
