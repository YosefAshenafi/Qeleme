# Qeleme - Educational Platform

Qeleme is a comprehensive educational platform that provides interactive learning experiences through various features including MCQs, flashcards, and more.

## Features

- **MCQ System**: Interactive multiple-choice questions for different grades and subjects
- **Flashcards**: Digital flashcards for effective learning
- **User Authentication**: Secure login and registration system
- **Profile Management**: User profile with statistics and settings
- **Payment Integration**: Secure payment processing for premium features

## API Endpoints

### Authentication

#### Register Student
```http
POST /api/auth/register/student
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "password": "securepassword",
  "grade": "Grade 5",
  "parentId": "0",
  "paymentPlan": "premium",
  "amountPaid": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user123",
    "username": "johndoe",
    "grade": "Grade 5"
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify
```

**Request Body:**
```json
{
  "phoneNumber": "+251910810689",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Student Profile

#### Get Student Profile
```http
GET /api/auth/student/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user123",
  "fullName": "John Doe",
  "username": "johndoe",
  "grade": "Grade 5",
  "stats": {
    "totalQuestions": 100,
    "correctAnswers": 75,
    "accuracy": 75
  }
}
```

### Learning Content

#### Get MCQ Data
```http
GET /api/mcq?gradeLevelId={gradeNumber}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "grades": [
    {
      "id": "grade-5",
      "name": "Grade 5",
      "subjects": [
        {
          "id": "math",
          "name": "Mathematics",
          "chapters": [
            {
              "id": "algebra",
              "name": "Algebra",
              "questions": [
                {
                  "id": "q1",
                  "question": "What is 2 + 2?",
                  "options": [
                    {"id": "1", "text": "3", "isCorrect": false},
                    {"id": "2", "text": "4", "isCorrect": true},
                    {"id": "3", "text": "5", "isCorrect": false}
                  ],
                  "explanation": "The correct answer is 4"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### Get National Exam Questions
```http
GET /api/questions/grouped?gradeLevelId={gradeLevelId}&yearId={yearId}&subject={subject}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "subject": "Mathematics",
      "year": 2023,
      "gradeLevel": 8,
      "questions": [
        {
          "id": "q1",
          "question": "What is the value of x in 2x + 5 = 15?",
          "options": [
            {"id": "1", "text": "5", "isCorrect": true},
            {"id": "2", "text": "7", "isCorrect": false},
            {"id": "3", "text": "10", "isCorrect": false}
          ],
          "explanation": "To solve for x, subtract 5 from both sides and divide by 2"
        }
      ]
    }
  ]
}
```

#### Get Available National Exams
```http
GET /api/national-exams/available/{gradeNumber}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": ["Mathematics", "English", "Science"],
    "years": [2023, 2022, 2021]
  }
}
```

#### Get Regular MCQ Questions
```http
GET /api/mcq/questions?gradeLevelId={gradeLevelId}&subjectId={subjectId}&chapterId={chapterId}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "q1",
      "question": "What is the capital of France?",
      "options": [
        {"id": "1", "text": "London", "isCorrect": false},
        {"id": "2", "text": "Paris", "isCorrect": true},
        {"id": "3", "text": "Berlin", "isCorrect": false}
      ],
      "explanation": "Paris is the capital city of France"
    }
  ]
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on your preferred platform:
- iOS Simulator: Press `i`
- Android Emulator: Press `a`
- Expo Go: Scan the QR code with your mobile device

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
EXPO_PUBLIC_API_URL=http://172.20.10.3:5001
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
