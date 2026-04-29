"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import { Container, H2 } from "@/components/primitives";
import CTA from "@/components/CTA";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.skyBlue};
  padding: 5rem 0 6rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Title = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.25rem;
  border: 0;
  background: white;
  font-family: inherit;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.navy};
  outline: none;
  transition: box-shadow ${({ theme }) => theme.transitions.fast};
  &:focus { box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.orange}; }
  &::placeholder { color: ${({ theme }) => theme.colors.greyLight}; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1.1rem 1.25rem;
  border: 0;
  background: white;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 140px;
  color: ${({ theme }) => theme.colors.navy};
  outline: none;
  grid-column: 1 / -1;
  &:focus { box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.orange}; }
  &::placeholder { color: ${({ theme }) => theme.colors.greyLight}; }
`;

const SubmitRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
`;

const Toast = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.navy};
`;

export default function ContactBlock({ title = "Contact", ctaLabel = "LEARN MORE" }) {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // No backend wired yet — this is a demonstration submit.
      // eslint-disable-next-line no-console
      console.log("[contact] submission:", state);
      setSent(true);
    },
    [state]
  );

  return (
    <Wrap>
      <Container>
        <Title>{title}</Title>
        <Form onSubmit={onSubmit} noValidate>
          <Input
            name="name"
            value={state.name}
            onChange={onChange}
            placeholder="Full Name"
            required
          />
          <Input
            name="email"
            type="email"
            value={state.email}
            onChange={onChange}
            placeholder="Email Address"
            required
          />
          <TextArea
            name="message"
            value={state.message}
            onChange={onChange}
            placeholder="Comments"
          />
          <SubmitRow>
            <CTA size="lg">{ctaLabel}</CTA>
          </SubmitRow>
        </Form>
        {sent && (
          <Toast role="status" aria-live="polite">
            Thank you — your message has been received.
          </Toast>
        )}
      </Container>
    </Wrap>
  );
}
