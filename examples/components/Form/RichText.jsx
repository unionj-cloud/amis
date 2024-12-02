import React from 'react';

export default {
  title: '富文本编辑器',
  body: [
    {
      type: 'form',
      api: '/api/mock2/saveForm?waitSeconds=2',
      title: 'Form elements',
      "mode": "horizontal",
  "wrapWithPanel": false,
      body: [
        {
          "type": "input-group",
          "name": "input-group",
          "label": "input 组合",
          "body": [
            {
              "type": "input-rich-text",
              "name": "description_of_system_test_results",
              "id": "richDescribe",
              "label": "描述",
              "vendor": "tinymce",
              "options": {
                "plugins": "advlist,autolink,link,image,lists,charmap,preview,anchor,pagebreak,searchreplace,wordcount,visualblocks,visualchars,code,fullscreen,insertdatetime,media,nonbreaking,table,emoticons,template,help",
                "toolbar": "undo redo formatselect bold italic backcolor alignleft aligncenter alignright alignjustify bullist numlist outdent indent removeformat help",
                "menubar": true,
                "convert_urls": false
              },
              "receiver": {
                "url": "/ecodwork/lowcode/image/upload/hc_aqcswtd",
                "method": "post",
                "requestAdaptor": "",
                "adaptor": "",
                "messages": {}
              },
              "static": false
            },
            {
              "type": "button",
              "label": "",
              "id": "richDescribeEdit",
              "onEvent": {
                "click": {
                  "actions": [
                    {
                      "componentId": "richDescribe",
                      "ignoreError": false,
                      "actionType": "nonstatic"
                    },
                    {
                      "componentId": "richDescribeView",
                      "ignoreError": false,
                      "actionType": "show"
                    },
                    {
                      "componentId": "richDescribeEdit",
                      "ignoreError": false,
                      "actionType": "hidden"
                    }
                  ]
                }
              },
              "visible": true,
              "icon": "fa fa-pencil",
              "wrapperCustomStyle": {},
              "block": false,
              "level": "default",
              "className": "absolute-btn"
            },
            {
              "type": "button",
              "label": "",
              "onEvent": {
                "click": {
                  "actions": [
                    {
                      "componentId": "richDescribe",
                      "ignoreError": false,
                      "actionType": "static"
                    },
                    {
                      "componentId": "richDescribeEdit",
                      "ignoreError": false,
                      "actionType": "show"
                    },
                    {
                      "componentId": "richDescribeView",
                      "ignoreError": false,
                      "actionType": "hidden"
                    }
                  ]
                }
              },
              "id": "richDescribeView",
              "icon": "fa fa-eye",
              "className": "absolute-btn"
            }
          ],
          "id": "u:0b800841623e",
          "className": "relative-box"
        }
      ]
    }
  ]
};
