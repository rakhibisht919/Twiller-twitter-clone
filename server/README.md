# Twiller Server

## Password Reset Functionality

The server now supports password reset via email and SMS. When a user requests a password reset, a temporary password is generated and sent to their email or phone number.

### Configuration

To enable email and SMS functionality, you need to configure the following environment variables in the `.env` file:

#### Email Configuration

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

- `EMAIL_SERVICE`: The email service provider (e.g., gmail, outlook, yahoo)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email password or app password (for Gmail, you need to generate an app password)

#### SMS Configuration

```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### How It Works

1. When a user requests a password reset, they enter their email or phone number.
2. The client generates a temporary password and sends it to the server along with the user's email or phone number.
3. The server attempts to store the reset request in the database and sends the temporary password to the user via email or SMS.
4. The user can then use the temporary password to log in to their account.

### Error Handling

The server is designed to handle various error scenarios:

- If the database connection fails, the server will still attempt to send the password reset message.
- If sending the email or SMS fails, the user will still see the generated password in the UI.
- All errors are logged to the console for debugging purposes.