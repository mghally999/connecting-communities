"use client";

import { useState, useCallback } from "react";
import styled from "styled-components";
import { Container, H2, Body } from "@/components/primitives";
import CTA from "@/components/CTA";

const Wrap = styled.section`
  background: ${({ theme }) => theme.colors.skyBlue};
  padding: 5rem 0 5.5rem;
  @media (max-width: 768px) { padding: 3.5rem 0 4rem; }
`;

const Grid = styled.div`
  display: grid;
  gap: 3rem;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const MapBox = styled.div`
  position: relative;
  background: white;
  aspect-ratio: 4 / 5;
  border-radius: 4px;
  overflow: hidden;
  iframe { width: 100%; height: 100%; border: 0; display: block; }
  @media (max-width: 900px) { aspect-ratio: 4 / 3; }
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const HQ = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  & h2 { font-size: clamp(1.85rem, 3vw, 2.4rem); }
`;

const Hr = styled.hr`
  border: 0;
  border-top: 1px solid rgba(11, 16, 24, 0.15);
  margin: 0.85rem 0;
`;

const Field = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.6;
  & b { font-weight: ${({ theme }) => theme.fontWeights.bold}; }
`;

const Form = styled.form`
  display: grid;
  gap: 0.85rem;
  grid-template-columns: 1fr;
  margin-top: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.95rem 1rem;
  border: 0;
  background: white;
  font-family: inherit;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.navy};
  outline: none;
  transition: box-shadow ${({ theme }) => theme.transitions.fast};
  &:focus { box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.orange}; }
  &::placeholder { color: ${({ theme }) => theme.colors.greyLight}; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.95rem 1rem;
  border: 0;
  background: white;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  color: ${({ theme }) => theme.colors.navy};
  outline: none;
  &:focus { box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.orange}; }
  &::placeholder { color: ${({ theme }) => theme.colors.greyLight}; }
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
`;

export default function ContactHQ({ data }) {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
  }, []);
  const onSubmit = useCallback((e) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log("[contact] submission:", state);
    setSent(true);
  }, [state]);

  return (
    <Wrap>
      <Container>
        <Grid>
          <MapBox>
            <iframe
              src={data.hqMapEmbed}
              title="Kigali map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </MapBox>
          <Right>
            <HQ>
              <H2>{data.hqTitle}</H2>
              <Body $muted style={{ marginTop: "0.4rem" }}>{data.hqOrgName}</Body>
              <Hr />
              <Field><b>Address:</b> {data.hqAddress}</Field>
              <Field><b>Email:</b> {data.hqEmail}</Field>
            </HQ>
            <Form onSubmit={onSubmit} noValidate>
              <Input name="name" value={state.name} onChange={onChange} placeholder="Full Name" required />
              <Input name="email" type="email" value={state.email} onChange={onChange} placeholder="Email Address" required />
              <TextArea name="message" value={state.message} onChange={onChange} placeholder="Comments" />
              <SubmitRow>
                <CTA size="lg">{data.formCtaLabel}</CTA>
              </SubmitRow>
              {sent && <Body style={{ textAlign: "center", marginTop: "0.5rem" }}>Thank you — your message has been received.</Body>}
            </Form>
          </Right>
        </Grid>
      </Container>
    </Wrap>
  );
}
