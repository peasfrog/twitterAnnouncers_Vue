define([
    'jquery',
    'vue',
    'vue-resource',
    'vue-strap',
    'vue-form',
    'lodash'
],
    function (
        $,
        Vue,
        vueResource,
        vueStrap,
        vueForm,
        _
    ) {
        'use strict';

        Vue.config.debug = true;
        Vue.use(vueResource);
        Vue.use(vueForm);

    /////////////////////////////////////////////////
        var MyHeader = Vue.extend({
            template: "#header-template",
            props: {
                heading: String,
                summary: String,
                label: String
            },
            data: function () {
                return {
                    header: {
                        buttonUrl: $('#endpoints').data('create'),
                        buttonToggle: "modal",
                        buttonTarget: "#modal",
                        buttonEnabled: (function () {
                            return ($('#endpoints').data('button-enabled').toLocaleLowerCase() === "true") ? true : false
                        }())
                    },
                    newAnnouncer: {
                        TwitterUserId: '',
                        TwitterUserName: '',
                        CollectRetweets: true
                    },
                    showAddForm: false,
                    announcer: {
                        name: '',
                        id: ''
                    },
                }
            },
            ready: function () {
            },
            methods: {
                add: function () {
                    this.$resource($("#endpoints").data('create'))
                        .save(this.newAnnouncer)
                        .then(
                            function (response) {
                                console.log(response);
                                var msg = {
                                    heading: response.data.message,
                                    body: response.data.data.TwitterUserName + ' has been added.'
                                };
                                this.$dispatch("Add_Element_Success", response.data, msg);
                                this.reset();
                            }, function (xhr, status, text) {
                                // error callback
                                var msg = {
                                    heading: response.data.message,
                                    body: response.data.data.TwitterUserName + ' has been added.'
                                };
                                this.$dispatch("Add_Element_Failure", this.newAnnouncer, msg);
                            });
                },
                reset: function () {
                    this.$set('newAnnouncer.id', '');
                    this.$set('newAnnouncer.name', '');
                    this.$set('newAnnouncer.collectReTweets', true);
                    //this.$set('announcer.announcerId' ,{});
                    //this.$set('announcer.announcerName', {});
                    this.$set('showAddForm', !this.showAddForm);
                },
                isInvalid: function () {
                    return this.$get('announcer.$invalid');
                }
            }
        });


        /////////////////////////////////////////////////////
        var MyList = Vue.extend({
            template: "#list-template",
            data: function () {
                return {
                    twitterAccounts: [],
                    total: 0,
                }
            },
            methods: {
                remove: function (announcer) {
                    //this.$get('announcers').$remove(announcer);
                    this.$resource($("#endpoints").data('delete')+ '{/id}')
                     .delete({id: announcer.TwitterUserId })
                     .then(function(response){
                         console.log(response);
                         var msg = {heading: "Twitter User Removed", body: "Twitter User" + announcer.TwitterUserName + " has been removed from the system."}

                         this.$dispatch('Remove_Element_Success', announcer, msg);
                         //this.announcers.$remove(announcer);
                     },function(xhr, status, text){
                         this.$dispatch('Remove_Element_Failure', msg)
                     });
                     //
                },
                isListTooLarge: function (data) {
                    if (data === undefined) return false;
                    return (data.length > 150);
                }
            },
            filters: {
                defaultTwitterName: function (model) {
                    return (model !== null) ? model : "(No Name)";
                },
                checkedStateClass: function (input) {
                    return (input) ? 'icon-ok text-info' : 'icon-warning-sign text-muted';
                },
                deleteAnnouncerTitle: function (announcer) {
                    var string;
                    if (announcer.HasSegmentMappings) {
                        string = "Twitter Account (@@" + announcer.TwitterUserName +
                            ") has segmentation mappings and cannot be deleted";
                    }
                    else {
                        string = "Delete this Twitter Account (@@" +
                            announcer.TwitterUserName + ")";
                    }
                    return string;
                }
            },
            events: {
                'render_list': function (data) {
                    this.$set('total', data.length);
                    if (!this.isListTooLarge(data)) {
                        this.$set('twitterAccounts', data);
                    }
                    ;
                },
                'reset_list': function (data) {
                    console.trace('child_list');
                    this.$set('total', data.length);
                }
            }
        });


        ////////////////////////////////////////////
        var MyFilter = Vue.extend({
            template: '#filter-template',
            data: function () {
                return {
                    filterBy: ''
                }
            },
            props: ['announcers', 'truncated-list'],
            computed: {
                total: function () {
                    return this.announcers.length
                },
                filtered: function () {
                    return (this.truncatedList.length > 0) ? this.truncatedList.length : this.announcers.length;
                }
            },
            methods: {
                setFilterString: function () {
                    var sanitized = this.filterBy.trim();
                    if (sanitized.match(/\S/))this.$dispatch('filter_list', sanitized);
                    if (this.filterBy === "")this.$dispatch('reset_filter');
                }
            },
            ready: function () {

            }
            //want model changes to cause a filter to another element's data
        });


        //////////////////////////////////
        new Vue({
            el: '#twitter-app',
            data: {
                announcers: [],
                truncatedList: [],
                showSuccess: false,
                showFailure: false,
                alert:{
                    heading: '',
                    body: ''
                },
                addFailure:{
                    heading: '',
                    body: ''
                }
            },
            components: {
                'my-header': MyHeader,
                'my-list': MyList,
                'my-filter': MyFilter,
                alert: vueStrap.alert
            },
            watch: {
                truncatedList: function (n, o) {
                    this.$emit('render_list', this.$get('truncatedList'))
                }
            },
            methods: {
                getAnnouncers: function () {
                    this.$resource($('#endpoints').data('list'))
                        .get()
                        .then(function (response) {

                            //response.data = response.data.splice(30, 100);

                            this.$set('announcers', response.data);

                            this.$emit('render_list', response.data);

                        });
                },
                addAccount: function (data) {
                    this.announcers.push(data);
                },
                filterBy: function (str) {
                    str = new RegExp(str, 'g');
                    this.truncatedList = _.filter(this.announcers, function (v, i) {
                        try {
                            return v.TwitterUserName.match(str)
                        } catch (e) {
                            return v;
                        }
                    });
                },
                removeElement: function (el) {
                    console.log(el);
                    //remove it from the cononcial store
                    this.$get('announcers').$remove(el);
                    //remove it from the display store
                    this.$get('truncatedList').$remove(el);
                    //render shortened list
                    this.$emit('render_list', this.$get('truncatedList'));
                }
            },
            ready: function () {
                this.getAnnouncers();
            },
            events: {
                //list of events to broacast from filter to list here.
                'render_list': function (data) {
                    this.$broadcast('render_list', data);
                },
                'filter_list': function (str) {
                    this.filterBy(str)
                },
                'reset_list': function () {
                    console.trace('parent_list');
                    this.$broadcast('reset_list', this.$get('announcers'));
                },
                'reset_filter': function () {
                    console.trace('parent_filter');
                    this.$set('truncatedList', this.$get('announcers'));
                },
                'remove_element': function (announcer, msg) {

                },
                'Add_Element_Success': function(data, msg){
                    this.addAccount(data);
                    this.$set('alert', msg);
                    this.showSuccess = !this.showSuccess;
                },
                'Add_Element_Failure': function(data, msg){
                    this.$set('alert', msg);
                    this.showFailure = !this.showFailure;
                },
                'Remove_Element_Success': function(data, msg){

                    this.$set('alert', msg);

                    this.showSuccess = !this.showSuccess;

                    this.removeElement(data);
                },
                'Remove_Element_Failure': function(){
                    this.$set('alert', msg);
                    this.showFailure = !this.showFailure;
                },

            }
        });
    });
