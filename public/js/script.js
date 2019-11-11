console.log("sanity check!!!");
(function() {
    Vue.component("image-modal", {
        // data, methods, mounted
        template: "#image-modal-template",
        // if we have camelCase in props,
        // in HTML we need kebab-case!
        props: ["imageId", "showModal"],
        data: function() {
            return {
                comments: [],
                // header: "Modal box",
                description: "",
                id: "",
                title: "",
                url: "",
                username: "",
                comment: "",
                created_at: ""
            };
        },
        mounted: function() {
            var me = this;
            console.log("this in component", this);
            axios
                .get("/modalbox/" + this.imageId)
                .then(function(resp) {
                    console.log("resp from axios get modal box:", resp);
                    me.description = resp.data[0].description;
                    me.id = resp.data[0].id;
                    me.title = resp.data[0].title;
                    me.url = resp.data[0].url;
                    me.username = resp.data[0].username;
                })
                .catch(function(err) {
                    console.log("err in axios get modal box:", err);
                });

            axios
                .get("/comments/" + this.imageId)
                .then(function(response) {
                    console.log(
                        "your data from axios get comments is: ",
                        response.data.rows
                    );
                    me.comments = response.data.rows;
                    // me.comment = response.data[0].comment;
                    // me.username = response.data[0].username;
                    // me.created_at = response.data[0].created_at;
                })
                .catch(err => {
                    console.log("The err in axios get comments is:", err);
                });
            // console.log("this in component: ", this);
            // mounted works the same as mounted in Vue instance
            // only difference is this function runs when the COMPONENT
            // mounts!
        },

        watcher: {
            id: function() {
                var me = this;
                axios.get("/image/" + this.imageId).then(function(response) {
                    console.log("Image data is: ", response.data);
                });
                console.log(me.images);
            }
        },
        // methods only run when a user does something (click, mouseover, etc.)
        methods: {
            closeModal: function() {
                this.$emit("close");
            },

            myClick: function() {
                // console.log('myClick running!');
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this in handleclick in component: ", this);
                var commentData = {
                    comment: this.comment,
                    username: this.username,
                    id: this.id
                };
                console.log(
                    "this data i want to pass to the server",
                    commentData
                );

                var me = this;
                axios
                    .post("/comment", commentData)
                    .then(function(resp) {
                        // console.log("resp from post /comment: ", resp);
                        // console.log(
                        //     "The response in post comment axios is:",
                        //     resp.data
                        // );
                        console.log(
                            "The axios.post  / comments is:",
                            me.comments
                        );
                        me.comments.unshift(resp.data);
                        // me.username.unshift(resp.data[0].username);
                        // me.id.unshift(resp.data[0].id);

                        // me.username.resp.data[0].username;
                    })
                    .catch(function(err) {
                        console.log("The error in post comment is : ", err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            // imageId: "",
            imageId: location.hash.slice(1),
            showModal: false,
            images: [],
            form: {
                title: "",
                description: "",
                username: "",
                url: "",
                file: null
            }
        },

        mounted: function() {
            // console.log("my vue was mounted");
            // console.log("Images is", this.images);
            var me = this;
            axios.get("/images").then(function(response) {
                // console.log("this.images in then", this.images);
                // console.log("me.images in then", me.images);
                // console.log("This is my response", response.data);
                me.images = response.data;
            });

            addEventListener("hashchange", function() {
                console.log("location.hash: ", location.hash);

                if (
                    location.hash.slice(1) != "" &&
                    !isNaN(location.hash.slice(1))
                ) {
                    me.imageId = location.hash.slice(1);
                    me.showModal = true;
                } else {
                    me.closeModalOnParent();
                }
            });
        },

        methods: {
            moreClick: function() {
                // e.preventDefault();
                console.log("this in moreClick:", this);

                var me = this;
                console.log(
                    "The axios me",
                    me.images[this.images.length - 1].id
                );
                axios
                    .get("/morebutton/" + me.images[this.images.length - 1].id)
                    .then(function(resp) {
                        console.log(
                            "resp from axios.get /morebutton",
                            resp.data
                        );

                        me.images.push(...resp.data); // push(); the image. Put it in the front of an array
                    })
                    .catch(function(err) {
                        console.log("err in get axios /morebutton", err);
                    });
            },

            closeModalOnParent: function() {
                console.log("closeModalOnParent running!");
                this.showModal = false;
                // here you can safely close the modal
            },

            showModalMethod: function(imagesId) {
                console.log("This is images id:", imagesId);
                console.log("This", this);
                //we add a variable represents  what we want
                // this is the Vue instance
                this.showModal = true;
                this.imageId = imagesId; //this.planet refers to the property planet inside the data
            },

            handleFileChange: function(e) {
                console.log("handleFileChange", e.target.files[0]);
                // put uploaded file in data
                this.form.file = e.target.files[0];
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this:", this);
                // we want to send all of those information to the server
                var formData = new FormData();
                formData.append("title", this.form.title); //with this.title i access the property title
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                formData.append("file", this.form.file);
                console.log(this.form);
                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        console.log("resp from post/upload:", resp);
                        me.images.unshift(resp.data[0]); // unshift the image. Put it in the front of an array
                    })
                    .catch(function(err) {
                        console.log("err in post/upload:", err);
                    });
            },

            handleChange: function(e) {
                // console.log("handleChange is running");
                // console.log("file", e.target.files[0]);

                this.file = e.target.files[0];
            }
        }
    });
})();
