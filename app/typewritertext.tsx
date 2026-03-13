import { animate, createScope, Scope } from 'animejs';
import { useEffect, useRef, useState } from "react";

import styles from "./typewritertext.module.css";


function Cursor() {
  const root = useRef<HTMLElement>(null);
  const scope = useRef<Scope>(null);

  useEffect(() => {
    scope.current = createScope({ root }).add( self => {
      const blink = animate('.cursor', {
        loop: true,
        duration: 750,
        opacity: [{ to: [1, 1] }, { to: [0, 0] }],
      });
    });

    return () => { scope.current?.revert(); }
  }, []);

  return (<span ref={root}><span className={`cursor ${styles.cursor}`}>█</span></span>)
}

function FadingLetter({ char }: { char: string }) {
  const root = useRef<HTMLElement>(null);
  const scope = useRef<Scope>(null);

  useEffect(() => {
    scope.current = createScope({ root }).add( self => {
      animate('.letter', {
        loop: false,
        // opacity: [{ to: [1, 1] }, { to: [0, 0] }],
        color: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#eeeeee'],
        duration: 100,
        ease: 'outBounce'
      });
    });
    return () => { scope.current?.revert(); }
  }, []);

  return (<span ref={root}><span className={`letter ${styles.letter}`}>
    {char == " " ? "\u00A0" : char}
  </span></span>);
}

function TypewriterLine( { text, cursor }: { text: string, cursor: boolean }) {
  const TYPE_AFTER_MS = 1_000;
  const JUMP_AFTER_MS = 80;

  const [index, setIndex] = useState(0);
  const [hasCursor, setHasCursor] = useState(true);

  const current = text.slice(0, index) || "";
  const lettersHtml = (!current) ? (<br/>) : current.split("").map((c, i) => {
    return (<FadingLetter key={`letter,${i}`} char={c}></FadingLetter>);
  });

  const lineHtml = (
    <>
      <p className="letters">{lettersHtml}{
        (hasCursor || cursor) ? (<Cursor></Cursor>) : null
        }</p>
    </>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(oldIndex => {
        if (oldIndex < text.length) {
          return oldIndex + 1;
        } else {
          clearInterval(interval);
          setHasCursor(false);
          //lineFinished();
          // const cursorRemove = setInterval(() => { setHasCursor(false); return () => clearInterval(cursorRemove); }, 500);
          return oldIndex;
        }
      })
    }, JUMP_AFTER_MS);

    //Clearing the interval
    return () => { clearInterval(interval); };
  }, [index, text.length]);

  if (current === "")
    return (<div><br/></div>);

  return (
    <div className={styles.text_animation}>
      {lineHtml}
    </div>
  );
}

function TypewriterText({ text, lines }: { text: string[], lines: number }) {
  // IMPORTANT: This code chokes on an empty string. Logic needs to be refactored
  const len = text.length;
  return text.map((v, idx) => <TypewriterLine key={idx} text={v} cursor={idx + 1 === len}></TypewriterLine>).slice(-lines);
/*
  const TYPE_AFTER_MS = 1_000;
  const JUMP_AFTER_MS = 80;

  const [index, setIndex] = useState(0);
  const [hasCursor, setHasCursor] = useState(true);

  const current = text.slice(0, index) || "";
  const lettersHtml: ReactNode[] = (!current) ? (<br/>) : current.split("").map((c, i) => {
    return (<FadingLetter key={`letter,${i}`} char={c}></FadingLetter>);
  });

  const lineHtml = (
    <>
      <div className="letters">{lettersHtml}{
        hasCursor ? (<Cursor></Cursor>) : null
        }</div>
    </>
  );
  const text_animation_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      setIndex(oldIndex => {
        if (oldIndex < text.length) {
          return oldIndex + 1;
        } else {
          clearInterval(interval);
          // const cursorRemove = setInterval(() => { setHasCursor(false); return () => clearInterval(cursorRemove); }, 500);
          return oldIndex;
        }
      })
    }, 100);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div ref={text_animation_ref} className={styles.text_animation}>
      <h1>{lineHtml}</h1>
    </div>
  );
  */
}

export default TypewriterText;
