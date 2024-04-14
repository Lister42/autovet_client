import React from "react";
import Link from "next/link";

export default function RedirectButton(props: {
  buttonText: string;
  urlText: string;
  className: string;
}) {
  const buttonText = props.buttonText;
  const urlText = props.urlText;
  const className = props.className;

  return (
    <Link href={urlText} className={className}>
      {buttonText}
    </Link>
  );
}
