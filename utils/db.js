const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/imageboard`);

// i limit to appear 3 photos before clicking more button
exports.getImagesTable = function() {
    return db
        .query(
            `SELECT url, username, title, description, id
            FROM images
            ORDER BY id DESC
            LIMIT 6
            `
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.addImages = function(url, username, title, description) {
    console.log("images");
    return db
        .query(
            `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
            [url, username, title, description]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getImages = function(imageId) {
    return db
        .query(
            `SELECT *
            FROM images
            WHERE id=$1
            `,
            [imageId]
        )
        .then(({ rows }) => {
            return rows;
        });
};

//COMMENTS
// to get the comments
exports.getComments = function() {
    return db
        .query(
            `SELECT comment,
                    username,
                    image_id,
                    created_at
            FROM comments
            `
        )
        .then(({ rows }) => {
            return rows;
        });
};
//to add the comments
exports.addComments = function(comment, username, image_id, created_at) {
    console.log(" comments data");
    return db
        .query(
            `INSERT INTO comments (comment, username, image_id, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id,comment,username`,
            [comment, username, image_id, created_at]
        )
        .then(({ rows }) => {
            return rows[0];
        });
};

exports.showComment = function(image_id) {
    return db.query(
        `SELECT comment,username,created_at
        FROM comments
         WHERE image_id=$1`,
        [image_id]
    );
};

//subquery for more button
exports.moreButton = function(image_id) {
    return db
        .query(
            `SELECT * , (
    SELECT id
    FROM images
    ORDER BY id ASC
    LIMIT 1
) AS "lowestId"
 FROM images
WHERE id < $1
ORDER BY id DESC
LIMIT 6`,
            [image_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};
