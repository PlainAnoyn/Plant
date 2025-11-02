'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I care for my new plant?',
    answer: 'Each plant comes with detailed care instructions. Generally, most indoor plants need bright, indirect light, regular watering (but not overwatering), and well-draining soil. Check the care guide included with your plant for specific requirements.',
  },
  {
    question: 'What is your shipping policy?',
    answer: 'We offer fast and secure shipping nationwide. Orders typically arrive within 3-5 business days. All plants are carefully packaged to ensure they arrive healthy and in perfect condition. Shipping costs are calculated at checkout based on your location.',
  },
  {
    question: 'Do you offer plant guarantees?',
    answer: 'Yes! We guarantee the health of your plant for 30 days after delivery. If your plant arrives damaged or dies within the guarantee period, contact us and we\'ll replace it or provide a full refund.',
  },
  {
    question: 'How often should I water my plants?',
    answer: 'Watering frequency depends on the plant type, season, and environment. Most houseplants prefer to dry out slightly between waterings. Check the soil moisture with your finger - if it\'s dry 1-2 inches down, it\'s time to water. Overwatering is the most common cause of plant problems.',
  },
  {
    question: 'Can I return a plant if I change my mind?',
    answer: 'We accept returns within 14 days of delivery for a full refund. The plant must be in its original condition and pot. Please contact us to initiate a return. Return shipping costs are the responsibility of the customer.',
  },
  {
    question: 'Do you sell plants suitable for beginners?',
    answer: 'Absolutely! We have a wide selection of easy-care plants perfect for beginners, including pothos, snake plants, ZZ plants, and peace lilies. Look for plants marked as "Beginner Friendly" on our website.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, PayPal, and Apple Pay. All payments are processed securely through encrypted payment gateways. We never store your payment information.',
  },
  {
    question: 'How do I know if a plant is right for my space?',
    answer: 'Each plant listing includes light requirements, size at maturity, and care difficulty level. Consider your space\'s lighting conditions (north, south, east, or west-facing windows), available space, and your experience level. Our plant care guides provide detailed information to help you choose the perfect plant.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-emerald-800 text-lg max-w-2xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about our plants and services.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-emerald-100"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-xl"
              >
                <span className="font-semibold text-emerald-900 text-lg pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-emerald-600 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-0">
                  <p className="text-emerald-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-emerald-100">
          <p className="text-emerald-800 mb-4 text-lg">
            Still have questions?
          </p>
          <p className="text-emerald-700 mb-6">
            We're here to help! Reach out to us and we'll get back to you as soon as possible.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="rounded-full px-8">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


