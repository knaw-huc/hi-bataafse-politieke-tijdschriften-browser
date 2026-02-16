import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type {Block} from "@knaw-huc/panoptes-react";

export interface MarkDownBlock extends Block {
    type: 'markdown';
    value: string;
}

export default function MarkdownBlockRenderer({block}: { block: Block }) {
    return (
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
            {(block as MarkDownBlock).value}
        </ReactMarkdown>
    );
}
