"use strict";var appVersion="0.1",firebaseURL="https://tg-folio.firebaseIO.com";angular.module("portfolioApp",["portfolio.filters","portfolio.services","portfolio.directives","portfolio.controllers","ngRoute","firebase","ui.bootstrap","ngSanitize"]).config(["$routeProvider",function(e){e.when("/",{templateUrl:"partials/blog.html",controller:"BlogCtrl"}).when("/posts/:id",{templateUrl:"partials/blog-item.html",controller:"PostCtrl"}).when("/posts/:id/edit",{templateUrl:"partials/add.html",controller:"AddEditCtrl",authRequired:true}).when("/tags/:tag",{templateUrl:"partials/blog-tag.html",controller:"TagCtrl"}).when("/search",{templateUrl:"partials/search.html",controller:"SearchCtrl"}).when("/cv",{templateUrl:"partials/cv.html",controller:"CvCtrl"}).when("/bio",{templateUrl:"partials/bio.html",controller:"BioCtrl"}).when("/login",{templateUrl:"partials/login.html",controller:"LoginCtrl"}).when("/add",{templateUrl:"partials/add.html",controller:"AddEditCtrl",authRequired:true}).otherwise({redirectTo:"/"})}]).constant("version",appVersion).constant("FBURL",firebaseURL).run(["$rootScope","$firebaseAuth","FBURL",function(e,t,n){var r=new Firebase(n);e.auth=t(r,{path:"/login"});e.FBURL=n}]);angular.module("cvApp",["portfolio.filters","portfolio.services","portfolio.directives","portfolio.controllers","ngRoute","firebase"]).constant("version",appVersion).constant("FBURL",firebaseURL).run(["$rootScope","FBURL",function(e,t){e.FBURL=t}]);angular.module("portfolio.controllers",[]).controller("CoreCtrl",["$rootScope","$scope","$firebase","loginService","FBURL",function(e,t,n,r,i){t.pagetitle={};t.pagetitle.pagename="Didacticode";t.mobilemenu=false;var s=(new Firebase(i)).child("/bio");t.bio=n(s);t.logout=function(){r.logout("/login")};t.openMenu=function(){t.mobilemenu=true};t.closeMenu=function(){t.mobilemenu=false};t.$on("$routeChangeSuccess",function(e,n,r){if(t.mobilemenu){t.closeMenu()}})}]).controller("BlogCtrl",["$scope","$firebase","FBURL",function(e,t,n){e.pagetitle.pagename="All Posts - Didacticode";var r=(new Firebase(n)).child("/posts");e.posts=t(r);e.posts.$on("change",function(){if(e.posts){angular.element(document.querySelector(".post-loader")).remove()}})}]).controller("PostCtrl",["$scope","$sce","$routeParams","$firebase","FBURL",function(e,t,n,r,i){e.postId=n.id;var s=(new Firebase(i)).child("/posts/"+e.postId);e.data=r(s);e.data.$on("change",function(){var t=e.data.title;if(t){e.pagetitle.pagename=t+" - Didacticode"}if(e.data){angular.element(document.querySelector(".post-loader")).remove()}});e.htmlUnsafe=function(){if(e.data.content){return t.trustAsHtml(e.data.content)}}}]).controller("TagCtrl",["$scope","$routeParams","$firebase","FBURL",function(e,t,n,r){e.tag=t.tag;e.pagetitle.pagename="Posts tagged "+e.tag+" - Didacticode";var i=(new Firebase(r)).child("/posts");e.posts=n(i);e.posts.$on("change",function(){if(e.posts){angular.element(document.querySelector(".post-loader")).remove()}})}]).controller("SearchCtrl",["$scope","$location","$firebase","FBURL",function(e,t,n,r){e.q=t.search();e.pagetitle.pagename="Search results - Didacticode";var i=(new Firebase(r)).child("/posts");e.posts=n(i);e.posts.$on("change",function(){if(e.posts){angular.element(document.querySelector(".post-loader")).remove()}})}]).controller("RecentPostsCtrl",["$scope","$firebase","FBURL",function(e,t,n){var r=(new Firebase(n)).child("/posts").limit(10);e.recentPosts=t(r);e.recentPosts.$on("change",function(){if(e.recentPosts){angular.element(document.querySelector(".recent-loader")).remove()}})}]).controller("TileGridCtrl",["$scope","$window",function(e,t){e.rowHeight=0;e.gridfillOptions={cols:3,tile_ratio:"4:3",selector:"blog-posts",tileSelector:"blog-post"};e.$parent.$on("ngRepeatFinished",function(){gridfill.initialize(e.gridfillOptions)});t.onresize=function(){var e=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;if(e>=960){gridfill.layoutGrid()}}}]).controller("TagCloudCtrl",["$scope","$firebase","FBURL",function(e,t,n){var r=(new Firebase(n)).child("/tags");e.tagData=t(r);e.tagData.$on("change",function(){if(e.tagData){angular.element(document.querySelector(".tagcloud-loader")).remove()}})}]).controller("HeaderCtrl",["$scope","$location",function(e,t){e.query=t.search().q;e.keywordSearch=function(){if(this.query){t.path("/search").search("q",this.query)}}}]).controller("CvCtrl",["$scope",function(e){e.pagetitle.pagename="Curriculum Vitae of Tim Geurts - Didacticode"}]).controller("BioCtrl",["$scope",function(e){e.pagetitle.pagename="More about the author: Tim Geurts - Didacticode"}]).controller("LoginCtrl",["$scope","loginService",function(e,t){e.pagetitle.pagename="Login - Didacticode";e.email=null;e.pass=null;e.remember=true;e.login=function(n){e.err=null;var r="/add";t.login(this.email,this.pass,this.remember,r,function(t,r){e.err=t||null;typeof n==="function"&&n(t,r)})}}]).controller("AddEditCtrl",["$scope","$q","$routeParams","$location","$firebase","FBURL",function(e,t,n,r,i,s){var o=function(){var r=(new Firebase(s)).child("/tags");e.editId=n.id;if(e.editId){e.pageHeading="Edit post: ";var o=(new Firebase(s)).child("/posts/"+e.editId);e.master=i(o);e.master.$on("change",function(){e.pageHeading="Edit post: "+e.master.title;e.pagetitle.pagename="Edit "+e.master.title+" - Didacticode";angular.forEach(e.master,function(t,n){if(typeof t==="function"){delete e.master[n]}});if(!e.master.tags){e.master.tags=[]}e.resetForm()})}else{e.pageHeading="Add Post";e.pagetitle.pagename="Add Post - Didacticode";e.master={author:"Tim Geurts",tags:[]}}e.tagList=["Portfolio","JavaScript","AngularJS","AngularFire","Firebase","HTML","CSS","App","WebApp"];e.tagData=i(r);e.newTag=null};o();e.dateOptions={"year-format":"'yy'","starting-day":1};e.openDate=function(t){t.preventDefault();t.stopPropagation();e.opened=true};e.tagData.$on("loaded",function(t){var n=[];angular.forEach(t,function(e,t){n.push(t)});e.tagList=n});e.addTag=function(){e.post.tags.push(e.newTag);var t=e.tagList.indexOf(e.newTag);if(~t){e.tagList.splice(t,1)}e.newTag=null};e.removeTag=function(t){var n=e.post.tags.indexOf(t);if(~n){e.post.tags.splice(n,1)}e.tagList.push(t);e.newTag=null};e.updateRelease=function(){var t=e.release_time;var n=e.release_date;if(n){n.setHours(t.getHours());n.setMinutes(t.getMinutes());n.setSeconds("00")}else{n=new Date}e.post.release=n.getTime()};e.resetRelease=function(){var t=new Date;e.release_date=t;e.release_time=t;e.master.release=t.getTime()};e.resetForm=function(){if(e.editId){var t;if(e.master.release){t=new Date(e.master.release)}else{t=new Date}e.release_time=t;e.release_date=t;var n=e.master.tags;angular.forEach(n,function(t,n){var r=e.tagList.indexOf(t);if(~r){e.tagList.splice(r,1)}})}else{e.resetRelease()}e.post=angular.copy(e.master)};e.savePost=function(){var n;var i="";if(e.editId){n=(new Firebase(s)).child("/posts/"+e.editId)}else{var o=new Date(e.post.release);var u=o.getFullYear().toString();var a=(o.getMonth()+1).toString();var f=o.getDate().toString();i+=u+"-"+(a[1]?a:"0"+a[0])+"-"+(f[1]?f:"0"+f[0])+"-";i+=encodeURIComponent(e.post.title.split(" ").join("-").split(".").join("-").toLowerCase());n=(new Firebase(s)).child("/posts/"+i)}var l=null;var c=null;if(e.editId){var h=e.post.tags.slice(0);var p=e.master.tags.slice(0);angular.forEach(p,function(e,t){var n=h.indexOf(e);if(~n){delete h[n];delete p[t]}l=h;c=p})}else{l=e.post.tags}var d=[];var v=function(e,n,r){var i=t.defer();var o=(new Firebase(s)).child("/tags/"+e);o.transaction(function(e){if(r){return e+1}else{return e-1}},function(e,t,n){if(t){i.resolve(n)}else{i.reject(e)}});d.push(i.promise)};if(l){angular.forEach(l,function(e,t){v(e,t,true)})}if(c){angular.forEach(c,function(e,t){v(e,t,false)})}var m=t.defer();n.set(e.post,function(e){if(e){m.reject(e)}else{m.resolve("post recorded")}});d.push(m.promise);t.all(d).then(function(){var t;if(e.editId){t=e.editId}else{t=i}r.path("/posts/"+t)},function(e){console.log(e);alert("Error: something went wrong your post has not been created.")})};e.resetForm()}]);angular.module("portfolio.directives",[]).directive("a",function(){return{restrict:"E",link:function(e,t,n){if(n.ngClick||n.href===""||n.href==="#"){t.on("click",function(e){e.preventDefault();if(n.ngClick){}})}}}}).directive("onFinishRender",function(e){return{restrict:"A",link:function(t,n,r){if(t.$last===true){e(function(){t.$emit("ngRepeatFinished")})}}}}).directive("tileGrid",function(){return{restrict:"EA",controller:"TileGridCtrl",scope:true}}).directive("blogHeader",function(){return{restrict:"EA",templateUrl:"partials/header.html",controller:"HeaderCtrl",scope:true,replace:true}}).directive("blogSidebar",function(){return{restrict:"EA",templateUrl:"partials/sidebar.html",replace:true}}).directive("blogTags",function(){return{restrict:"EA",templateUrl:"partials/tag-cloud.html",controller:"TagCloudCtrl",replace:true,scope:true}}).directive("postTags",function(){return{restrict:"EA",templateUrl:"partials/tag-cloud-post.html",controller:"TagCloudCtrl",replace:true,scope:true}}).directive("recentPosts",function(){return{restrict:"EA",templateUrl:"partials/recent-posts.html",controller:"RecentPostsCtrl",replace:true,scope:true}}).directive("portfolioCv",function(){return{restrict:"EA",templateUrl:"partials/cv.html"}});angular.module("portfolio.filters",[]).filter("releaseDate",function(){return function(e){var t=(new Date).getTime();var n=[];angular.forEach(e,function(e,r){if(typeof e==="function"){}else if(t>parseInt(e.release,10)){e.id=r;n.push(e)}});n.sort(function(e,t){e=parseInt(e.release);t=parseInt(t.release);return t-e});return n}}).filter("excludePost",function(){return function(e,t){if(t){angular.forEach(e,function(n,r){if(typeof t==="string"){if(r===t){delete e[t]}}else{var i=t.indexOf(r);if(~i){var s=t[i];delete e[s]}}})}return e}}).filter("tileSize",function(){return function(e){angular.forEach(e,function(t,n){if(n===0||t.featured){e[n].size=2}else{e[n].size=1}});return e}}).filter("searchTag",function(){return function(e,t){var n={};angular.forEach(e,function(e,r){if(typeof e!=="function"){var i=e.tags.map(function(e){return e.toLowerCase()});if(i.indexOf(t.toLowerCase())>=0){n[r]=e}}});return n}}).filter("postTag",function(){return function(e,t){if(t){var n={};angular.forEach(e,function(e,r){if(t.indexOf(r)>=0){n[r]=e}});return n}else{return e}}}).filter("searchQuery",function(){return function(e,t){var n={};angular.forEach(e,function(e,r){if(typeof e==="function"){n[r]=e}else{var i=function(t){if(e.tags){var i=e.tags.map(function(e){return e.toLowerCase()});if(i.indexOf(t)>=0){n[r]=e}}};var s=function(t){if(e.via){if(e.via.label){var i=e.via.label.toLowerCase();if(i.indexOf(t)>=0){n[r]=e}}if(e.via.link){var s=e.via.link.toLowerCase();if(s.indexOf(t)>=0){n[r]=e}}}};if(t.q){var o=t.q.split(" ").map(function(e){return e.toLowerCase()});var u=e.title.split(" ").map(function(e){return e.toLowerCase()});var a=e.content.split(" ").map(function(e){return e.toLowerCase()});if(!t.t){angular.forEach(o,function(e,t){i(e)})}if(!t.v){angular.forEach(o,function(e,t){s(e)})}angular.forEach(u,function(t,i){angular.forEach(o,function(i,s){if(t.indexOf(i)>=0){n[r]=e}})});angular.forEach(u,function(t,i){angular.forEach(o,function(i,s){if(t.indexOf(i)>=0){n[r]=e}})})}if(t.t){i(t.t.toLowerCase())}if(t.v){s(t.v.toLowerCase())}}});return n}}).filter("reverse",function(){return function(e){return e.slice().reverse()}}).filter("nospace",function(){return function(e){if(e){return e.replace(/\s/g,"")}}}).filter("titlecase",function(){return function(e){var t=/^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;return e.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g,function(e,n,r){if(n>0&&n+e.length!==r.length&&e.search(t)>-1&&r.charAt(n-2)!==":"&&(r.charAt(n+e.length)!=="-"||r.charAt(n-1)==="-")&&r.charAt(n-1).search(/[^\s-]/)<0){return e.toLowerCase()}if(e.substr(1).search(/[A-Z]|\../)>-1){return e}return e.charAt(0).toUpperCase()+e.substr(1)})}});(function(){"use strict";function e(e){return e?"["+e.code+"] "+e.toString():null}angular.module("portfolio.services",[]).factory("isEmpty",function(){return function(e){if(e===null||e===undefined){return true}if(e.length&&e.length>0){return false}if(e.length===0){return true}for(var t in e){if(hasOwnProperty.call(e,t)){return false}}return true}}).factory("loginService",["$rootScope","$location","FBURL",function(e,t,n){return{login:function(n,r,i,s,o){e.auth.$login("password",{email:n,password:r,rememberMe:i}).then(function(e){if(s){t.path(s)}o&&o(null,e)},o)},logout:function(n){e.auth.$logout();if(n){t.path(n)}}}}])})()