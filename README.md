# AI Random Time Table Generator

A modern web-based AI-powered timetable generation system designed for educational institutions.

## Features

- **Multi-Step Timetable Generation**: Intuitive wizard-based interface
- **Section Management**: Create and manage multiple sections
- **Course Management**: Add courses with teachers, rooms, and time slots
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Responsive Design**: Works seamlessly across all devices
- **User Authentication**: Secure login and registration system

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS with responsive design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-timetable-generator.git
cd ai-timetable-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timetable
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Setup College Timings**: Configure your institution's working hours
2. **Add Sections**: Create sections for different classes/departments
3. **Add Courses**: Input course details with teachers and rooms
4. **Generate Timetable**: Let the AI create optimized schedules

## Project Structure

```
├── images/                 # Static images
├── js/                    # JavaScript modules
│   ├── auth.js           # Authentication logic
│   └── nav.js            # Navigation handling
├── timetable-wizard/      # Multi-step form components
├── index.html            # Landing page
├── timetable-generator.html # Main application
├── login.html            # Authentication page
├── about.html            # About page
├── styles.css            # Main stylesheet
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Vignan Lara Institute of Technology and Sciences**
- Email: aitimetablegenerator@gmail.com
- Department: CSE Department, Vadlamudi, Andhra Pradesh

## Acknowledgments

- Vignan Lara Institute of Technology and Sciences
- CSE Department Faculty and Students
- All contributors and testers