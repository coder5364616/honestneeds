'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiPhone, FiClock, FiSend } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1000px;
  margin: 60px auto;
  padding: 0 24px;
`;

const ContactGrid = styled.div`
  display: grid;
  gap: 48px;
  margin-top: 40px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1.5fr;
  }
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: flex-start;
  gap: 16px;

  svg {
    font-size: 24px;
    color: #6366F1;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const InfoContent = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
    color: #1E293B;
  }
  p {
    font-size: 0.95rem;
    color: #64748B;
    line-height: 1.5;
    margin: 0;
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 12px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #64748B;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
  background: white;

  &:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoUrl = `mailto:jbowser727@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Container>
      <Title>Contact Honest Need</Title>
      <Subtitle>We&apos;re here to help. Reach out any time.</Subtitle>
      
      <ContactGrid>
        <InfoColumn>
          <InfoCard>
            <FiMail />
            <InfoContent>
              <h3>Email Support</h3>
              <p>jbowser727@gmail.com</p>
            </InfoContent>
          </InfoCard>

          <InfoCard>
            <FiPhone />
            <InfoContent>
              <h3>Phone Support</h3>
              <p>(209) 622-9391</p>
            </InfoContent>
          </InfoCard>

          <InfoCard>
            <FiClock />
            <InfoContent>
              <h3>Expected Response</h3>
              <p>We respond to all inquiries within 24–48 business hours.</p>
            </InfoContent>
          </InfoCard>
        </InfoColumn>

        <FormCard>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="James Bowser"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="yourname@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option>General Inquiry</option>
                <option>Campaign Support</option>
                <option>Sponsorship Opportunity</option>
                <option>Refund/Dispute request</option>
                <option>Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="How can we bless you today?"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <SubmitButton type="submit">
              Send Message <FiSend />
            </SubmitButton>
          </Form>
        </FormCard>
      </ContactGrid>
    </Container>
  );
}
