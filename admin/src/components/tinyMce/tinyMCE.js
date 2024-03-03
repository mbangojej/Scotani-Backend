import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { ENV } from "../../config/config";
import template from 'raw-loader!./../../assets/templates/template1.html';
import template2 from 'raw-loader!./../../assets/templates/template2.html';
import '../../assets/css/tinymce.css';

function TinyMCE(props) { 
    return (
        <React.Fragment>
            <Editor
                apiKey='xen9rjkyskx8jyt74j4k55zpc31w3hth4f1jkquwb6a3iu5u'
                // initialValue={props.value}
                value={props.value}
                init={{
                    selector: 'textarea#open-source-plugins',
                    plugins: 'preview autolink save directionality code visualchars fullscreen image link media table anchor lists emoticons template',
                    imagetools_cors_hosts: ['picsum.photos'],
                    menubar: 'file edit view insert format tools table help',
                    toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | fullscreen  preview | insertfile image media template link anchor codesample',
                    toolbar_sticky: false,
                    image_advtab: true,
                    importcss_append: true,
                    images_upload_url: ENV.url + 'content/upload',
                    height: 600,
                    image_caption: true,
                    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    noneditable_noneditable_class: 'mceNonEditable',
                    toolbar_mode: 'sliding',
                    contextmenu: 'link image imagetools table',
                    skin: 'oxide-dark',
                    valid_children: '+body[style]',
                    content_css: ['../../assets/css/tinymce.css', 'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css'].join('\n'),
                    templates: [
                        {title: 'Template 1', description: 'This is the first template', content:template},
                        {title: 'Template 2', description: 'This is the second template', content:template2}
                    ]
                }}
                onEditorChange={(content) => props.onEditorChange(content)}
            />
        </React.Fragment>
    );
};

export default TinyMCE;