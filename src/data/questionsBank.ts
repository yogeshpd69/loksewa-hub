export type QuestionCategory = 'GK' | 'BCT' | 'BEI' | 'IQ' | 'Management';
export type Organization = 'PSC' | 'NTC' | 'NEA' | 'CAAN' | 'ALL';

export interface Question {
  id: string;
  category: QuestionCategory;
  organization: Organization[];
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const mockQuestions: Question[] = [
  // --- GENERAL KNOWLEDGE (GK) ---
  {
    id: 'gk-1',
    category: 'GK',
    organization: ['ALL'],
    questionText: 'According to the Constitution of Nepal 2072, which part deals with Fundamental Rights and Duties?',
    options: ['Part 2', 'Part 3', 'Part 4', 'Part 5'],
    correctAnswerIndex: 1, // Part 3
    explanation: 'Part 3 of the Constitution of Nepal (Articles 16 to 48) contains the 31 Fundamental Rights and the Duties of Citizens.',
  },
  {
    id: 'gk-2',
    category: 'GK',
    organization: ['ALL'],
    questionText: 'Who is the first elected Prime Minister of Nepal?',
    options: ['B.P. Koirala', 'Matrika Prasad Koirala', 'Tank Prasad Acharya', 'Girija Prasad Koirala'],
    correctAnswerIndex: 0,
    explanation: 'Bishweshwar Prasad Koirala (B.P. Koirala) was the first democratically elected Prime Minister of Nepal in 1959.',
  },
  {
    id: 'gk-3',
    category: 'GK',
    organization: ['PSC', 'NTC', 'NEA', 'CAAN'],
    questionText: 'Which is the deepest lake of Nepal?',
    options: ['Rara Lake', 'Phewa Lake', 'Phoksundo Lake', 'Tilicho Lake'],
    correctAnswerIndex: 2,
    explanation: 'Phoksundo Lake, located in the Dolpa district, is the deepest lake in Nepal with a maximum depth of 145 meters.',
  },
  {
    id: 'gk-4',
    category: 'GK',
    organization: ['NTC', 'NEA'],
    questionText: 'When was Nepal Telecommunication Corporation (now NTC) officially established as a fully government-owned corporation?',
    options: ['2032 B.S.', '2041 B.S.', '2060 B.S.', '2026 B.S.'],
    correctAnswerIndex: 0,
    explanation: 'Nepal Telecommunication Corporation was formally established in 2032 B.S. (1975 A.D.) and was later transformed into Nepal Doorsanchar Company Limited (NTC) in 2060 B.S.',
  },

  // --- BCT (Computer Engineering) ---
  {
    id: 'bct-1',
    category: 'BCT',
    organization: ['PSC', 'NTC', 'NEA', 'CAAN'],
    questionText: 'In a relational database, what does the ACID property stand for?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Accuracy, Completeness, Integrity, Durability',
      'Atomicity, Concurrency, Isolation, Durability',
      'Allocation, Consistency, Integrity, Dependency'
    ],
    correctAnswerIndex: 0,
    explanation: 'ACID stands for Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent execution is safe), and Durability (committed data is saved).',
  },
  {
    id: 'bct-2',
    category: 'BCT',
    organization: ['NTC', 'PSC'],
    questionText: 'Which layer of the OSI model is responsible for routing packets across network boundaries?',
    options: ['Data Link Layer', 'Transport Layer', 'Network Layer', 'Session Layer'],
    correctAnswerIndex: 2,
    explanation: 'The Network Layer (Layer 3) handles routing and forwarding of data packets. IP (Internet Protocol) operates at this layer.',
  },
  {
    id: 'bct-3',
    category: 'BCT',
    organization: ['PSC', 'NTC', 'NEA'],
    questionText: 'In Operating Systems, the problem of indefinite blockage of low-priority processes is known as:',
    options: ['Deadlock', 'Starvation', 'Thrashing', 'Race Condition'],
    correctAnswerIndex: 1,
    explanation: 'Starvation (or indefinite blocking) occurs when low priority processes wait indefinitely because the CPU is constantly allocated to higher priority processes. Aging is used to solve this.',
  },
  {
    id: 'bct-4',
    category: 'BCT',
    organization: ['NTC', 'CAAN'],
    questionText: 'Which data structure is primarily used for implementing a LIFO (Last In First Out) operation?',
    options: ['Queue', 'Linked List', 'Tree', 'Stack'],
    correctAnswerIndex: 3,
    explanation: 'A Stack follows the Last In First Out (LIFO) principle. Operations are push (insert) and pop (remove) at the top of the stack.',
  },

  // --- BEI (Electronics & Communication Engineering) ---
  {
    id: 'bei-1',
    category: 'BEI',
    organization: ['NTC', 'CAAN', 'PSC'],
    questionText: 'According to Nyquist Sampling Theorem, the sampling frequency (fs) must be:',
    options: [
      'fs = fm',
      'fs ≥ 2fm',
      'fs ≤ 2fm',
      'fs = fm / 2'
    ],
    correctAnswerIndex: 1,
    explanation: 'The Nyquist-Shannon sampling theorem states that the sampling rate must be at least twice the maximum frequency component (fm) of the signal to prevent aliasing.',
  },
  {
    id: 'bei-2',
    category: 'BEI',
    organization: ['NTC', 'NEA'],
    questionText: 'Which multiplexing technique is widely used in optical fiber communication?',
    options: ['TDM', 'FDM', 'WDM', 'CDMA'],
    correctAnswerIndex: 2,
    explanation: 'Wavelength Division Multiplexing (WDM) is extensively used in optical fiber systems to transmit multiple signals simultaneously using different wavelengths (colors) of laser light.',
  },
  {
    id: 'bei-3',
    category: 'BEI',
    organization: ['NTC', 'CAAN'],
    questionText: 'In a common-emitter amplifier, the phase difference between the input and output voltage is:',
    options: ['0 degrees', '90 degrees', '180 degrees', '360 degrees'],
    correctAnswerIndex: 2,
    explanation: 'A common-emitter amplifier inverts the input signal, meaning there is a 180-degree phase shift between the input and output voltage.',
  },
  {
    id: 'bei-4',
    category: 'BEI',
    organization: ['NTC', 'PSC'],
    questionText: 'The process of varying one or more properties of a periodic waveform, called the carrier signal, with a modulating signal that contains information to be transmitted is called:',
    options: ['Multiplexing', 'Modulation', 'Attenuation', 'Demodulation'],
    correctAnswerIndex: 1,
    explanation: 'Modulation is the process of superimposing a low-frequency information signal (modulating signal) onto a high-frequency carrier signal for transmission.',
  }
];
