// var notify = {
//     pushEnabled: false,
//     init: function() {
//         if ('serviceWorker' in navigator) {
//             navigator.serviceWorker.register('sw.js', {
//                 scope: '/'
//             }).then(function(reg) {
//                 // registration worked
//                 console.log('Registration succeeded. Scope is ' + reg.scope);
// 
//                 if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
//                     console.warn('Notifications aren\'t supported.');
//                     return;
//                 }
// 
//                 // Check the current Notification permission.  
//                 // If its denied, it's a permanent block until the  
//                 // user changes the permission  
//                 if (Notification.permission === 'denied') {
//                     console.warn('The user has blocked notifications.');
//                     return;
//                 }
// 
//                 // Check if push messaging is supported  
//                 if (!('PushManager' in window)) {
//                     console.warn('Push messaging isn\'t supported.');
//                     return;
//                 }
//                 // We need the service worker registration to check for a subscription  
//                 navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
//                     // Do we already have a push message subscription?  
//                     serviceWorkerRegistration.pushManager.getSubscription().then(function(subscription) {
//                             // Enable any UI which subscribes / unsubscribes from  
//                             // push messages.  
//                             var pushButton = $('.notify')[0];
//                             pushButton.disabled = false;
// 
//                             if (!subscription) {
//                                 // We aren't subscribed to push, so set UI  
//                                 // to allow the user to enable push  
//                                 return;
//                             }
// 
//                             // Keep your server in sync with the latest subscriptionId
//                             sendSubscriptionToServer(subscription);
// 
//                             // Set your UI to show they have subscribed for  
//                             // push messages  
//                             pushButton.textContent = 'Disable Push Messages';
//                             isPushEnabled = true;
//                         })
//                         .catch(function(err) {
//                             console.warn('Error during getSubscription()', err);
//                         });
//                 });
//             }).catch(function(error) {
//                 // registration failed
//                 console.log('Registration failed with ' + error);
//             });
//         };
//     }
// };
// 
// $(document).ready(function() {
//     var pushButton = $('.notify')[0];
//     pushButton.addEventListener('click', function() {
//         if (isPushEnabled) {
//             unsubscribe();
//         } else {
//             subscribe();
//         }
//     });
//     setTimeout(notify.init, 5000);
// });
// 
// 
// // navigator.serviceWorker.register('sw.js');
// // Notification.requestPermission(function(result) {
// //     if (result === 'granted') {
// //         navigator.serviceWorker.ready.then(function(registration) {
// //             registration.showNotification('Notification with ServiceWorker');
// //         });
// //     }
// // });
// // 
// // // Notification.requestPermission(function(permission) {
// // //     notification.create("welcome", {
// // //         title: "Welcome",
// // //         body: "Thank you for enabling desktop notifications.",
// // //         close: 2500
// // //     });
// // // });
// // // 
// // // var notification = {};
// // // 
// // // notification.notifications = {};
// // // 
// // // notification.create = function(registration, id, options) {
// // //     if (Notification.permission === "granted") {
// // //         notification.notifications.id = new Notification(options.title, options);
// // //         if (options.close !== undefined) {
// // //             console.log("Close " + id + " in " + options.close);
// // //             notification.close(id, options.close);
// // //         }
// // //     }
// // // };
// // // 
// // // notification.close = function(id, time, callback) {
// // //     setTimeout(function() {
// // //         notification.notifications.id.close();
// // //         if (typeof callback == "function") {
// // //             return callback(id);
// // //         } else {
// // //             return true;
// // //         }
// // //     }, time);
// // // };