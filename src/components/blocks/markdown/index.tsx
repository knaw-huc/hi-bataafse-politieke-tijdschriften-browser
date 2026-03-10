import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type {Block} from "@knaw-huc/panoptes-react";
import classes from "../Blocks.module.css";

export interface MarkDownBlock extends Block {
    type: 'markdown';
    value: string;
}

export default function MarkdownBlockRenderer({block}: { block: Block }) {
    const { value } = block;

    if (!value || value === '') {
        return <span className={classes.empty}>—</span>;
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({node, ...props}) => <a className={classes.link} {...props} />
            }}
        >
            {(block as MarkDownBlock).value}
        </ReactMarkdown>
    );
}
