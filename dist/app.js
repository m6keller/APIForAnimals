"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mysql_1 = __importDefault(require("mysql"));
var app = (0, express_1.default)();
var router = express_1.default.Router();
var bodyParser = require('body-parser');
// connection can be set from command line with:
// // pscale connect animals dev --execute "npm run dev"
var connection = mysql_1.default.createConnection(process.env.DATABASE_URL || "");
var port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express_1.default.static('public'));
app.use('/', router);
app.use(errorHandler);
var ApiError = /** @class */ (function () {
    function ApiError(code, message) {
        this.code = code;
        this.message = message;
    }
    ApiError.badRequest = function (msg) {
        return new ApiError(400, msg);
    };
    ApiError.internalError = function (msg) {
        return new ApiError(500, msg);
    };
    return ApiError;
}());
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof ApiError) {
        res.status(err.code).json(err.message);
        return;
    }
    res.status(500).json("something went wrong");
}
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get('/update', function (req, res) {
    res.sendFile(__dirname + "/update.html");
});
app.get("/api/animals", function (req, res) {
    var query = "SELECT * FROM Animal_Data";
    connection.query(query, function (err, rows) {
        if (err)
            throw err;
        return res.send(rows);
    });
});
app.get("/api/animals/:name", function (req, res, next) {
    var name = req.params.name;
    var query = "SELECT * FROM Animal_Data WHERE name = \"" + name + "\"";
    connection.query(query, function (err, rows) {
        if (err)
            throw err;
        if (rows.length === 0) {
            next(ApiError.badRequest("no record of this animal in the database"));
            return;
        }
        return res.send(rows);
    });
});
router.post('/update/animal', function (req, res, next) {
    var name = req.body.name;
    var newName = req.body.new_name;
    var newLatinName = req.body.new_latin_name || "";
    var newImage = req.body.new_image || "";
    if (newImage === "" && newLatinName === "" && newName === "") {
        next(ApiError.badRequest("no information inputted"));
        return;
    }
    if (newImage != "") {
        var sql = "UPDATE Animal_Data SET image = \"" + newImage + "\" WHERE name = \"" + name + "\"";
        connection.query(sql, function (err, result) {
            if (err)
                throw err;
            console.log('record updated');
        });
    }
    if (newLatinName != "") {
        var sql = "UPDATE Animal_Data SET latin_name = \"" + newLatinName + "\" WHERE name = \"" + name + "\"";
        connection.query(sql, function (err, result) {
            if (err)
                throw err;
            console.log('record updated');
        });
    }
    if (newName != "") {
        var sql = "UPDATE Animal_Data SET name = \"" + newName + "\" WHERE name = \"" + name + "\"";
        connection.query(sql, function (err, result) {
            if (err)
                throw err;
            console.log('record updated');
        });
    }
    return res.redirect("/");
});
router.post('/insert/animal', function (req, res, next) {
    var name = req.body.name || "";
    var latin_name = req.body.latin_name || "";
    var image = req.body.image || "";
    if (name === "") {
        next(ApiError.badRequest("message has no content"));
        return;
    }
    var sqlInsert = "INSERT INTO Animal_Data (name, latin_name, image ) VALUES ( \"".concat(name, "\", \"").concat(latin_name, "\", \"").concat(image, "\" );");
    connection.query(sqlInsert, function (err, result) {
        if (err)
            throw err;
        console.log('record inserted');
    });
    return res.redirect('/');
});
app.get('/delete/name/:name', function (req, res, next) {
    var name = req.params.name;
    var query = "DELETE FROM Animal_Data WHERE name = " + name;
    connection.query(query, [name], function (err, result) {
        if (err)
            throw err;
        if (result.length === 0) {
            next(ApiError.badRequest("no record of this animal in the database"));
            return;
        }
        console.log(result.affectedRows + " record(s) updated");
    });
    res.redirect('/');
});
app.get('/delete/id/:id', function (req, res, next) {
    var id = req.params.id;
    var query = "DELETE FROM Animal_Data WHERE id = " + id;
    connection.query(query, [id], function (err, result) {
        if (err)
            throw err;
        if (result.length === 0) {
            next(ApiError.badRequest("no record of this animal in the database"));
            return;
        }
        console.log(result.affectedRows + " record(s) updated");
    });
    res.redirect('/');
});
// // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   });
app.get("/api/animals/:id", function (req, res) {
    var id = req.params.id;
    var query = "SELECT * FROM Animal_Data WHERE ID = " + id + " LIMIT 1";
    connection.query(query, function (err, rows) {
        if (err)
            throw err;
        var animal = {
            data: rows.length > 0 ? rows[0] : null,
            message: rows.length === 0 ? "No record" : ""
        };
        return res.send(animal);
    });
});
app.get("/about", function (req, res) {
    res.send("This is an API for Reya Co-op Application");
});
app.listen(port, function () {
    console.log("App is running on port " + port);
});
//# sourceMappingURL=app.js.map