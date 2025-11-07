<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Two-Factor Authentication Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #333;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .code-box {
            background-color: #f4f4f4;
            border: 2px solid #1a1a1a;
            padding: 20px;
            text-align: center;
            border-radius: 4px;
            margin: 30px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #1a1a1a;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, {{ $userName }}!</h1>
        
        <p>You requested a two-factor authentication code to access your account.</p>
        
        <p>Your verification code is:</p>
        
        <div class="code-box">
            <div class="code">{{ $code }}</div>
        </div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        
        <div class="warning">
            <strong>Security Notice:</strong> If you did not request this code, please ignore this email and ensure your account is secure.
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} AI Tools Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
