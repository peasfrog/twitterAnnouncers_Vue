/**
 * Created by jsullivan on 5/31/2016.
 */
define([
    'jquery',
    'vue',
    'vue-resource',
    'vue-form'
], function($,
            Vue,
            vueResource,
            vueForm
){
    'use-strict';

    Vue.config.debug = true;
    Vue.use(vueResource);
    Vue.use(vueForm);

    return Vue.extend({
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
                    email: '',
                    name: '',
                    collectReTweets: true
                },
                showForm: false,
                announcer: {
                    name: '',
                    id: ''
                }
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
                            //feedback.$emit('success', response);
                        }, function (response) {
                            // error callback
                            //feedback.$emit('failure', response);
                            //this.$set('showModal', false)
                        });
            },
            reset: function () {
                this.$set('newAnnouncer.id', '');
                this.$set('newAnnouncer.name', '');
                this.$set('newAnnouncer.collectReTweets', true);
                //this.$set('announcer.announcerId' ,{});
                //this.$set('announcer.announcerName', {});
                this.$set('showForm', !this.showForm);
            },
            submit: function (args) {
                console.log(args);
            },
            isInvalid: function () {
                return this.$get('announcer.$invalid');
            }
        }
    });
});
