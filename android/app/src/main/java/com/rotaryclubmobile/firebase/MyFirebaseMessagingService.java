package com.rotaryclubmobile.firebase;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.rotaryclubmobile.MainActivity;
import com.rotaryclubmobile.R;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMsgService";
    private static final String CHANNEL_ID = "rotary_notifications";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // Handle FCM messages here.
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            
            // Handle data payload
            handleDataPayload(remoteMessage.getData());
        }

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
            
            // Show notification
            sendNotification(
                remoteMessage.getNotification().getTitle(),
                remoteMessage.getNotification().getBody(),
                remoteMessage.getData()
            );
        }
    }

    /**
     * Called if the FCM registration token is updated.
     */
    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);

        // Send token to app server
        sendRegistrationToServer(token);
    }

    /**
     * Handle data payload of FCM message.
     */
    private void handleDataPayload(java.util.Map<String, String> data) {
        String type = data.get("type");
        
        if (type != null) {
            switch (type) {
                case "reunion_reminder":
                    handleReunionReminder(data);
                    break;
                case "finance_due":
                    handleFinanceDue(data);
                    break;
                case "announcement":
                    handleAnnouncement(data);
                    break;
                default:
                    Log.w(TAG, "Unknown notification type: " + type);
            }
        }
    }

    private void handleReunionReminder(java.util.Map<String, String> data) {
        String reunionId = data.get("reunionId");
        String title = data.get("title");
        String time = data.get("time");
        
        Log.d(TAG, "Reunion reminder: " + reunionId);
        // Additional handling logic here
    }

    private void handleFinanceDue(java.util.Map<String, String> data) {
        String amount = data.get("amount");
        String dueDate = data.get("dueDate");
        
        Log.d(TAG, "Finance due: " + amount);
        // Additional handling logic here
    }

    private void handleAnnouncement(java.util.Map<String, String> data) {
        String senderId = data.get("senderId");
        String message = data.get("message");
        
        Log.d(TAG, "Announcement from: " + senderId);
        // Additional handling logic here
    }

    /**
     * Create and show a simple notification containing the received FCM message.
     */
    private void sendNotification(String title, String messageBody, java.util.Map<String, String> data) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // Add data to intent for deep linking
        if (data != null) {
            for (java.util.Map.Entry<String, String> entry : data.entrySet()) {
                intent.putExtra(entry.getKey(), entry.getValue());
            }
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent,
                PendingIntent.FLAG_IMMUTABLE);

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(R.drawable.ic_notification)
                        .setContentTitle(title != null ? title : "Rotary Club")
                        .setContentText(messageBody)
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setContentIntent(pendingIntent)
                        .setPriority(NotificationCompat.PRIORITY_HIGH);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        notificationManager.notify(0, notificationBuilder.build());
    }

    /**
     * Persist token to third-party servers.
     */
    private void sendRegistrationToServer(String token) {
        // TODO: Implement this method to send token to your app server.
        Log.d(TAG, "Token sent to server: " + token);
    }

    /**
     * Create notification channel for Android O and above.
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Rotary Notifications";
            String description = "Notifications for Rotary Club events and updates";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.enableVibration(true);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
