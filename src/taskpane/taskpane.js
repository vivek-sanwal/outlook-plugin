/* global Office console */

export async function insertText(text) {
  // Write text to the cursor point in the compose surface.
  try {
    Office.context.mailbox.item?.body.setSelectedDataAsync(
      text,
      { coercionType: Office.CoercionType.Text },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          throw asyncResult.error.message;
        }
      }
    );
  } catch (error) {
    console.log("Error: " + error);
  }
}

Office.onReady(function(info){
  if(info.platform === Office.PlatformType.OfficeOnline)
  {

  }
  console.log(info.platform);
  console.log(info.host);
  // Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function(bodyTtext){
  //   console.log(28);
  //   console.log(bodyTtext);
  // });    

  // Office.context.mailbox.item.body.getTypeAsync(function(bodyTtext){
  //   console.log(38);
  //   console.log(bodyTtext);
  // });      
});
