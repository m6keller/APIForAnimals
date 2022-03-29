import express, {Request, response, Response} from 'express';
import mysql from 'mysql';

 
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
 
// connection can be set from command line with:
// // pscale connect animals dev --execute "npm run dev"
const connection = mysql.createConnection( process.env.DATABASE_URL || "" )
 
const port = process.env.PORT || 3000;
 
app.use(bodyParser.urlencoded({extended: false }));
app.use(express.static('public'));
app.use('/', router);

app.get('/', (req: Request, res: Response) => {
   res.sendFile(__dirname + "/index.html");
});
 
app.get('/update', (req: Request, res: Response) => {
   res.sendFile(__dirname + "/update.html");
});
 
 
app.get( "/api/animals", (req: Request, res: Response, next ) => {
   const query = "SELECT * FROM Animal_Data";
   connection.query( query, (err, rows) => {
       if( err ) throw err;
       if( rows.length === 0 ) {
            let error = new Error("No animals exists in the database")
            next( error.message );
            return;
        }
       return res.send( rows );
   })
});
 
router.post( "/api/search", (req: Request, res: Response, next ) => {
    var search: string = req.body.search;
    console.log( search );
    return res.redirect( "/api/animals/name/" + search);
});

app.get( "/api/animals/name/:name", (req: Request, res: Response, next ) => {
    const name = req.params.name;
    const query = "SELECT * FROM Animal_Data WHERE name = \"" + name + "\"";
    connection.query( query, (err, rows) => {
        if( err ) throw err;
        if( rows.length === 0 ) {
            let error = new Error("No animal with name " + name + " exists in the database")
            next( error.message );
            return;
        }
        return res.send( rows );
    });
});
 
app.get( "/api/animals/id/:id", (req: Request, res: Response, next ) => {
    const id: any = req.params.id;
    if ( !id.isInteger() ) {
        const error = new Error("Please input an integer value for the animal ID")
        next( error.message );
        return;
    }
   const query = "SELECT * FROM Animal_Data WHERE id = " + id;
   connection.query( query, (err, rows) => {
       if( err ) throw err;
       if( rows.length === 0 ) {
           const error = new Error("No animal with id " + id + " exists in the database")
           next( error.message );
           return;
       }
       return res.send( rows );
   })
});
 
router.post('/api/insert/animal', (req: Request, res: Response, next ) => {
  
    var name: string = req.body.name || "";
    var latin_name: string = req.body.latin_name || "";
    var image: string = req.body.image || "";
  
    if( name === "" ) {
        const error = new Error("message has no content")
        next( error.message );
        return;
    }

    var sqlInsert = `INSERT INTO Animal_Data (name, latin_name, image ) VALUES ( "${name}", "${latin_name}", "${image}" );`;
    connection.query(sqlInsert, (err, result) => {
        if (err) throw err;
        console.log('record inserted');
    });
   
    return res.redirect('/');  
 });
router.post( '/api/update/animal', (req: Request, res: Response, next ) => {
   var name: string = req.body.name;
   var newName: string = req.body.new_name
   var newLatinName: string = req.body.new_latin_name || "";
   var newImage: string = req.body.new_image || "";
   if( newImage === "" && newLatinName === "" &&  newName === "" ) {
        const error = new Error("message has no content")
        next( error );
        return;
   }
   if( newImage != "" ) {
       var sql = "UPDATE Animal_Data SET image = \"" + newImage + "\" WHERE name = \"" + name + "\"";
       connection.query( sql, (err, result) => {
           if (err) throw err;
           console.log('record updated');
       });
   }
   if( newLatinName != "" ) {
       var sql = "UPDATE Animal_Data SET latin_name = \"" + newLatinName + "\" WHERE name = \"" + name + "\"";
       connection.query( sql, (err, result) => {
           if (err) throw err;
           console.log('record updated');
       });
   }
   if( newName != "" ) {
       var sql = "UPDATE Animal_Data SET name = \"" + newName + "\" WHERE name = \"" + name + "\"";
       connection.query( sql, (err, result) => {
           if (err) throw err;
           console.log('record updated');
       });
   }
   return res.redirect( "/" );
});
 
 
app.get('/api/delete/name/:name', function(req: Request, res: Response, next) {
   var name = req.params.name;
   var query = "DELETE FROM Animal_Data WHERE name = " + name;
   connection.query(query, [name], function (err, result) {
       if (err) throw err;
       if( result.length === 0 ) {
            const error = new Error("this animal does not exist in the database")
            next( error );
            return;
       }
       console.log(result.affectedRows + " record(s) updated");
       res.redirect('/');
   });
});
 
app.get('/api/delete/id/:id', function(req, res, next) {
    var id: any = req.params.id;
        if ( !id.isInteger() ) {
        const error = new Error("Please input an integer value for the animal ID")
        next( error.message );
        return;
    }  
    var check = "SELECT * FROM Animal_Data WHERE id = " + id;
    connection.query(check, [id], function (err, result) {
        if (err) throw err;
        if( result.length === 0 ) {
            console.log( "result 0" );
            const error = new Error("No record of this animal in the database")
            next( error );
            return;
        }
    });
   var query = "DELETE FROM Animal_Data WHERE id = " + id;

   connection.query(query, [id], function (err, result) {
       if (err) throw err;
       console.log(result.affectedRows + " record(s) updated");
       return res.send( "/" );
   });
});
 
 
app.get( "/about", (req: Request, res: Response ) => {
   res.send( "This is an API for Reya Co-op Application" );
});
 
app.listen(port, () => {
   console.log("App is running on port " + port );
});
 

