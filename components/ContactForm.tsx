"use client";
import { FormEvent, useState } from "react";
import { Icon } from "./Icon";
import { FieldError } from "./UI";
export function ContactForm() {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [errors,setErrors]=useState<Record<string,string>>({}); const [sent,setSent]=useState(false);
  const submit=(e:FormEvent)=>{e.preventDefault();const next:Record<string,string>={};if(name.trim().length<2)next.name="Enter your name.";if(!/^\S+@\S+\.\S+$/.test(email))next.email="Enter a valid email.";if(message.trim().length<10)next.message="Tell us a little more (at least 10 characters).";setErrors(next);if(!Object.keys(next).length)setSent(true);};
  if(sent)return <div className="contact-success"><div className="success-mark"><Icon name="check" size={34}/></div><h2>Message noted.</h2><p>This frontend demo does not send messages to a server. In a production build, your note would be on its way to our team.</p><button className="button button-outline" onClick={()=>{setSent(false);setMessage("");}}>Write another</button></div>;
  return <form className="contact-form" onSubmit={submit} noValidate><label>Name<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name"/><FieldError>{errors.name}</FieldError></label><label>Work email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com"/><FieldError>{errors.email}</FieldError></label><label>How can we help?<textarea rows={6} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Tell us about your team or ask a privacy question…"/><FieldError>{errors.message}</FieldError></label><button className="button">Send demo message <Icon name="arrow"/></button><p className="form-note">Demo only: this form validates locally and does not transmit your message.</p></form>;
}
