namespace PhoneShop.API.Dtos
{
   
        public class AddSerialDto
        {
            public int VariantId { get; set; }
            public List<string> Imeis { get; set; } = new List<string>();
        }

        public class AssignImeiDto
        {
            public int OrderId { get; set; }
            public int SerialNumberId { get; set; }
            public int ProductVariantId { get; set; }
    }
    
}
