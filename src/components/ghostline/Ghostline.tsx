import classes from "./Ghostline.module.css";

export default function GhostLine() {
    return (
        <div className={classes.container}>
            <div className={classes.line} />
        </div>
    );
}
