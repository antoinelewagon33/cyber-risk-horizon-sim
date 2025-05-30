
# CyberRisk Simulator

A modern web application for simulating cyber attack scenarios and assessing their business impact. Built as an educational tool for students to understand cybersecurity risks and their financial implications.

## Features

- **Interactive Dashboard**: Modern dark theme with neon accents and cybersecurity-inspired design
- **Scenario Selection**: Multiple cyber attack scenarios (ransomware, data breach, phishing, DDoS, etc.)
- **Risk Assessment**: Calculate financial, operational, and reputational impact
- **Simulation History**: Track and visualize past simulations with charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Persistence**: Local storage with Firebase integration support

## Available Scenarios

1. **Ransomware Attack** - Malicious software encrypts critical systems
2. **Data Breach** - Unauthorized access to sensitive data
3. **Phishing Campaign** - Social engineering targeting employee credentials
4. **DDoS Attack** - Distributed denial of service overwhelming infrastructure
5. **Insider Threat** - Malicious or negligent actions by internal personnel
6. **Supply Chain Attack** - Compromise through third-party vendors

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom cyber theme
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React hooks
- **Data Storage**: localStorage (Firebase ready)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cyberrisk-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:8080`

### Firebase Integration (Optional)

To enable cloud storage with Firebase:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Update `src/utils/firestore.ts` with your Firebase configuration
4. Uncomment the Firebase implementation in the firestore utility

## Project Structure

```
src/
├── components/          # React components
│   ├── ScenarioSelector.tsx
│   ├── SimulationForm.tsx
│   ├── ResultsDisplay.tsx
│   └── SimulationHistory.tsx
├── types/              # TypeScript type definitions
│   └── simulation.ts
├── utils/              # Utility functions
│   ├── riskCalculations.ts
│   └── firestore.ts
├── pages/              # Page components
│   └── Index.tsx
└── hooks/              # Custom React hooks
```

## Risk Calculation Logic

The application uses realistic business impact calculations based on:

- **Financial Impact**: Direct losses, operational costs, regulatory fines
- **Operational Impact**: Downtime, affected systems, recovery time  
- **Reputational Impact**: Brand damage, customer trust, recovery timeline
- **Risk Factors**: Industry type, company size, security posture

### Scenario Multipliers

Each scenario has different impact characteristics:
- Ransomware: High financial impact, extended downtime
- Data Breach: Regulatory compliance issues, reputation damage
- Phishing: Variable impact based on success rate
- DDoS: Primarily operational, shorter recovery time

## Educational Value

This simulator helps students understand:

- Real-world financial impact of cyber attacks
- Importance of incident response planning
- Value of cybersecurity investments
- Risk assessment methodologies
- Business continuity considerations

## Customization

### Adding New Scenarios

1. Update scenario configurations in `src/utils/riskCalculations.ts`
2. Add scenario to the selector in `src/components/ScenarioSelector.tsx`
3. Update type definitions if needed

### Modifying Risk Calculations

Edit the calculation logic in `src/utils/riskCalculations.ts`:
- Adjust base impact multipliers
- Modify downtime calculations
- Update recommendation algorithms

### Styling Changes

The application uses a custom cyber theme defined in:
- `tailwind.config.ts` - Color palette and animations
- `src/index.css` - CSS custom properties and utilities

## Contributing

This is an educational project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is intended for educational use. Please check with your institution regarding usage and distribution.

## Disclaimer

This simulator is for educational purposes only. Risk calculations are simplified models and should not be used for actual business risk assessment or insurance purposes.
